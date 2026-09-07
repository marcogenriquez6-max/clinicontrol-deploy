import { TrendingUp, RefreshCw, Printer } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card } from '../components/ui';
import { useIndicadores } from './GerenciaDashboardPage';
import { fmtBs, fmtFecha, imprimirReporte } from '../utils/impresion';

/** Gerencia → Indicadores: valores del día con su lectura operativa. */
export default function IndicadoresPage() {
  const { ind, loading, reload } = useIndicadores(20000);
  const filas = ind ? [
    { indicador: 'Pacientes registrados hoy', valor: ind.pacientesDelDia, lectura: 'Nuevos expedientes creados por recepción' },
    { indicador: 'Total de pacientes activos', valor: ind.totalPacientes, lectura: 'Padrón de la clínica' },
    { indicador: 'Citas programadas para hoy', valor: ind.citasHoy, lectura: 'Agenda del día' },
    { indicador: 'Turnos emitidos hoy', valor: ind.turnosHoy, lectura: 'Pacientes que pasaron por recepción' },
    { indicador: 'Consultas realizadas hoy', valor: ind.consultasRealizadas, lectura: 'Atenciones médicas registradas (SOAP)' },
    { indicador: 'Triajes realizados hoy', valor: ind.triajesRealizados, lectura: 'Clasificaciones ESI de enfermería' },
    { indicador: 'Pacientes hospitalizados', valor: ind.hospitalizados, lectura: 'Internados en este momento' },
    { indicador: 'Camas ocupadas', valor: `${ind.camas.ocupadas} de ${ind.camas.total}`, lectura: `${ind.camas.porcentajeOcupacion}% de ocupación · ${ind.camas.disponibles} disponibles` },
    { indicador: 'Pagos registrados hoy', valor: fmtBs(ind.pagosHoy.total), lectura: `${ind.pagosHoy.cantidad} recibo(s) emitido(s)` },
  ] : [];

  const imprimir = () => imprimirReporte('Indicadores del día', `Corte: ${fmtFecha(new Date(), true)}`, [{
    titulo: 'Indicadores operativos',
    columnas: [{ key: 'indicador', header: 'Indicador' }, { key: 'valor', header: 'Valor', align: 'right' }, { key: 'lectura', header: 'Lectura' }],
    filas: filas as unknown as Record<string, unknown>[],
  }], { registrar: { reporte: 'indicadores', detalle: 'Indicadores del día' } });

  return (
    <div className="space-y-6">
      <PageHeader icon={TrendingUp} title="Indicadores" subtitle="Lectura operativa del día: pacientes, consultas, triajes, hospitalización y ocupación"
        action={<div className="flex gap-2"><Button variant="secondary" onClick={reload} loading={loading}><RefreshCw className="w-4 h-4" />Actualizar</Button><Button onClick={imprimir} disabled={!ind}><Printer className="w-4 h-4" />Imprimir</Button></div>} />
      <Card className="!p-0 overflow-hidden">
        <table className="table-premium w-full text-sm">
          <thead><tr><th>Indicador</th><th className="text-right">Valor</th><th>Lectura</th></tr></thead>
          <tbody>
            {loading && !ind && <tr><td colSpan={3} className="text-center py-8 text-[var(--text-tertiary)]">Cargando…</td></tr>}
            {filas.map((f) => <tr key={f.indicador}><td className="font-medium text-[var(--text-primary)]">{f.indicador}</td><td className="text-right text-lg font-bold tabular-nums">{f.valor}</td><td className="text-[var(--text-secondary)]">{f.lectura}</td></tr>)}
          </tbody>
        </table>
      </Card>
      {ind && (
        <Card title="Ocupación de camas">
          <div className="h-4 rounded-full bg-[var(--bg-tertiary)] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${ind.camas.porcentajeOcupacion}%`, backgroundColor: ind.camas.porcentajeOcupacion > 85 ? 'var(--danger-500)' : ind.camas.porcentajeOcupacion > 60 ? 'var(--warning-500)' : 'var(--success-500)' }} /></div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">{ind.camas.ocupadas} ocupadas · {ind.camas.disponibles} disponibles · {ind.camas.total} totales</p>
        </Card>
      )}
    </div>
  );
}
