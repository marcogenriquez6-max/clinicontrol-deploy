import { useEffect, useState } from 'react';
import { BarChart3, Printer, CalendarRange } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card, Input, KpiCard } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { errMsg } from '../api/errMsg';
import { reportesService } from '../api/reportes.service';
import BarrasSimple from '../components/reportes/BarrasSimple';
import { objeto, hoyIso } from '../utils/api.utils';
import { fmtFecha, imprimirReporte, periodoTexto } from '../utils/impresion';

interface Estadisticas {
  totales: { consultas: number; citas: number; triajes: number; pacientesNuevos: number };
  consultasPorDia: { fecha: string; total: number }[];
  consultasPorEspecialidad: { nombre: string; total: number }[];
  consultasPorMedico: { nombre: string; total: number }[];
  citasPorEstado: { nombre: string; total: number }[];
  triajesPorNivel: { nivel: number; total: number }[];
  diagnosticosTop: { codigo: string; descripcion: string; total: number }[];
}
const inicioMes = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; };

/** Gerencia → Estadísticas: distribuciones del período con gráficos simples. */
export default function EstadisticasPage() {
  const [desde, setDesde] = useState(inicioMes());
  const [hasta, setHasta] = useState(hoyIso());
  const [data, setData] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData(objeto<Estadisticas>(await reportesService.estadisticas({ fechaInicio: desde, fechaFin: hasta }))); }
    catch (e) { toast('error', 'No se pudieron cargar las estadísticas', errMsg(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const imprimir = () => data && imprimirReporte('Estadísticas del período', periodoTexto(desde, hasta), [
    { titulo: 'Totales', resumen: [{ label: 'Consultas', value: data.totales.consultas }, { label: 'Citas', value: data.totales.citas }, { label: 'Triajes', value: data.totales.triajes }, { label: 'Pacientes nuevos', value: data.totales.pacientesNuevos }] },
    { titulo: 'Consultas por especialidad', columnas: [{ key: 'nombre', header: 'Especialidad' }, { key: 'total', header: 'Consultas', align: 'right' }], filas: data.consultasPorEspecialidad as unknown as Record<string, unknown>[] },
    { titulo: 'Consultas por médico', columnas: [{ key: 'nombre', header: 'Médico' }, { key: 'total', header: 'Consultas', align: 'right' }], filas: data.consultasPorMedico as unknown as Record<string, unknown>[] },
    { titulo: 'Citas por estado', columnas: [{ key: 'nombre', header: 'Estado' }, { key: 'total', header: 'Citas', align: 'right' }], filas: data.citasPorEstado as unknown as Record<string, unknown>[] },
    { titulo: 'Triajes por nivel ESI', columnas: [{ key: 'nivel', header: 'Nivel', format: (f) => `ESI-${f.nivel}` }, { key: 'total', header: 'Pacientes', align: 'right' }], filas: data.triajesPorNivel as unknown as Record<string, unknown>[] },
    { titulo: 'Diagnósticos más frecuentes', columnas: [{ key: 'codigo', header: 'CIE-10' }, { key: 'descripcion', header: 'Descripción' }, { key: 'total', header: 'Casos', align: 'right' }], filas: data.diagnosticosTop as unknown as Record<string, unknown>[] },
    { titulo: 'Consultas por día', columnas: [{ key: 'fecha', header: 'Fecha', format: (f) => fmtFecha((f.fecha as string) + 'T00:00:00') }, { key: 'total', header: 'Consultas', align: 'right' }], filas: data.consultasPorDia as unknown as Record<string, unknown>[] },
  ], { registrar: { reporte: 'estadisticas', detalle: `${desde} a ${hasta}` } });

  return (
    <div className="space-y-6">
      <PageHeader icon={BarChart3} title="Estadísticas" subtitle="Consultas, citas, triajes y diagnósticos del período seleccionado"
        action={<Button onClick={imprimir} disabled={!data}><Printer className="w-4 h-4" />Imprimir</Button>} />
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Input label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <Input label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <Button variant="secondary" onClick={load} loading={loading}><CalendarRange className="w-4 h-4" />Aplicar período</Button>
        </div>
      </Card>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={BarChart3} label="Consultas" value={data?.totales.consultas ?? 0} color="blue" loading={loading && !data} />
        <KpiCard icon={BarChart3} label="Citas" value={data?.totales.citas ?? 0} color="violet" loading={loading && !data} />
        <KpiCard icon={BarChart3} label="Triajes" value={data?.totales.triajes ?? 0} color="rose" loading={loading && !data} />
        <KpiCard icon={BarChart3} label="Pacientes nuevos" value={data?.totales.pacientesNuevos ?? 0} color="emerald" loading={loading && !data} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Consultas por especialidad"><BarrasSimple items={data?.consultasPorEspecialidad ?? []} /></Card>
        <Card title="Consultas por médico"><BarrasSimple items={data?.consultasPorMedico ?? []} color="var(--success-500)" /></Card>
        <Card title="Citas por estado"><BarrasSimple items={data?.citasPorEstado ?? []} color="var(--warning-500)" /></Card>
        <Card title="Triajes por nivel ESI"><BarrasSimple items={(data?.triajesPorNivel ?? []).map((t) => ({ nombre: `ESI-${t.nivel}`, total: t.total }))} color="var(--danger-500)" /></Card>
        <Card title="Diagnósticos más frecuentes"><BarrasSimple items={(data?.diagnosticosTop ?? []).map((d) => ({ nombre: `${d.codigo} ${d.descripcion}`, total: d.total }))} color="var(--primary-700)" /></Card>
        <Card title="Consultas por día"><BarrasSimple items={(data?.consultasPorDia ?? []).map((d) => ({ nombre: fmtFecha(d.fecha + 'T00:00:00'), total: d.total }))} color="var(--primary-400)" /></Card>
      </div>
    </div>
  );
}
