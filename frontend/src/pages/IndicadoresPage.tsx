import { TrendingUp, RefreshCw, Printer } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card, DataTable, type Column } from '../components/ui';
import { useIndicadores } from './GerenciaDashboardPage';
import { fmtBs, fmtFecha, imprimirReporte } from '../utils/impresion';

interface FilaIndicador { indicador: string; valor: string; lectura: string }

/** Gerencia → Indicadores: valores del día con su lectura operativa. */
export default function IndicadoresPage() {
  const { ind, loading, reload } = useIndicadores(20000);
  const filas: FilaIndicador[] = ind ? [
    { indicador: 'Pacientes registrados hoy', valor: String(ind.pacientesDelDia), lectura: 'Nuevos expedientes creados por recepción' },
    { indicador: 'Total de pacientes activos', valor: String(ind.totalPacientes), lectura: 'Padrón de la clínica' },
    { indicador: 'Citas programadas para hoy', valor: String(ind.citasHoy), lectura: 'Agenda del día' },
    { indicador: 'Turnos emitidos hoy', valor: String(ind.turnosHoy), lectura: 'Pacientes que pasaron por recepción' },
    { indicador: 'Consultas realizadas hoy', valor: String(ind.consultasRealizadas), lectura: 'Atenciones médicas registradas (SOAP)' },
    { indicador: 'Triajes realizados hoy', valor: String(ind.triajesRealizados), lectura: 'Clasificaciones ESI de enfermería' },
    { indicador: 'Pacientes hospitalizados', valor: String(ind.hospitalizados), lectura: 'Internados en este momento' },
    { indicador: 'Camas ocupadas', valor: `${ind.camas.ocupadas} de ${ind.camas.total}`, lectura: `${ind.camas.porcentajeOcupacion}% de ocupación · ${ind.camas.disponibles} disponibles` },
    { indicador: 'Pagos registrados hoy', valor: fmtBs(ind.pagosHoy.total), lectura: `${ind.pagosHoy.cantidad} recibo(s) emitido(s)` },
  ] : [];

  const columnas: Column<FilaIndicador>[] = [
    { key: 'indicador', header: 'Indicador' },
    { key: 'valor', header: 'Valor', align: 'right', render: (f) => <span className="text-lg font-bold tabular-nums">{f.valor}</span> },
    { key: 'lectura', header: 'Lectura' },
  ];

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
        <DataTable
          title="Indicadores del día"
          columns={columnas}
          data={filas}
          keyExtractor={(f) => f.indicador}
          loading={loading && !ind}
          pageSize={10}
          searchable={false}
          emptyMessage="Cargando…"
        />
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
