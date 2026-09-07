import { ClipboardList } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import ReportePanel, { type ReporteDefinicion } from '../components/reportes/ReportePanel';
import { reportesService } from '../api/reportes.service';
import { objeto } from '../utils/api.utils';
import { fmtBs, fmtFecha, type SeccionReporte } from '../utils/impresion';
import { estadoTurnoLabel } from '../utils/turno.utils';

type Fila = Record<string, unknown>;
interface Recepcion {
  pacientesRegistrados: { total: number; lista: Fila[] };
  citasProgramadas: { total: number; lista: Fila[] };
  turnosEmitidos: { total: number; lista: Fila[] };
  pagosRegistrados: { total: number; montoTotal: number; anulados: number; lista: Fila[] };
}

const cargarRecepcion = async (p: { fechaInicio: string; fechaFin: string }) => objeto<Recepcion>(await reportesService.recepcion(p));

const secPacientes = (r: Recepcion): SeccionReporte => ({
  titulo: 'Pacientes registrados',
  resumen: [{ label: 'Pacientes nuevos', value: r.pacientesRegistrados.total }],
  columnas: [
    { key: 'fecha', header: 'Fecha', format: (f) => fmtFecha(f.fecha as string) },
    { key: 'ci', header: 'CI' }, { key: 'nombre', header: 'Paciente' }, { key: 'genero', header: 'Género' }, { key: 'telefono', header: 'Teléfono' },
  ],
  filas: r.pacientesRegistrados.lista,
});
const secCitas = (r: Recepcion): SeccionReporte => ({
  titulo: 'Citas programadas',
  resumen: [{ label: 'Citas', value: r.citasProgramadas.total }],
  columnas: [
    { key: 'fecha', header: 'Fecha', format: (f) => fmtFecha(f.fecha as string) }, { key: 'hora', header: 'Hora' },
    { key: 'paciente', header: 'Paciente' }, { key: 'medico', header: 'Médico' }, { key: 'estado', header: 'Estado' },
  ],
  filas: r.citasProgramadas.lista,
});
const secTurnos = (r: Recepcion): SeccionReporte => ({
  titulo: 'Turnos emitidos',
  resumen: [{ label: 'Turnos', value: r.turnosEmitidos.total }, { label: 'Pagados', value: r.turnosEmitidos.lista.filter((t) => t.pagado).length }],
  columnas: [
    { key: 'fecha', header: 'Fecha', format: (f) => fmtFecha(f.fecha as string, true) }, { key: 'turno', header: 'Turno' },
    { key: 'paciente', header: 'Paciente' }, { key: 'medico', header: 'Médico' },
    { key: 'estado', header: 'Estado', format: (f) => estadoTurnoLabel(f.estado as string) },
    { key: 'pagado', header: 'Pago', format: (f) => (f.pagado ? 'Pagado' : 'Pendiente') },
  ],
  filas: r.turnosEmitidos.lista,
});
const secPagos = (r: Recepcion): SeccionReporte => ({
  titulo: 'Pagos registrados',
  resumen: [{ label: 'Recibos', value: r.pagosRegistrados.total }, { label: 'Total cobrado', value: fmtBs(r.pagosRegistrados.montoTotal) }, { label: 'Anulados', value: r.pagosRegistrados.anulados }],
  columnas: [
    { key: 'fecha', header: 'Fecha', format: (f) => fmtFecha(f.fecha as string, true) }, { key: 'recibo', header: 'N° Recibo' },
    { key: 'paciente', header: 'Paciente' }, { key: 'concepto', header: 'Concepto' },
    { key: 'monto', header: 'Monto', align: 'right', format: (f) => fmtBs(f.monto as number) },
    { key: 'estado', header: 'Estado', format: (f) => String(f.estado).toUpperCase() },
  ],
  filas: r.pagosRegistrados.lista,
});

const REPORTES: ReporteDefinicion[] = [
  { id: 'recepcion-completo', titulo: 'Reporte de Recepción', descripcion: 'Pacientes registrados, citas programadas, turnos emitidos y pagos registrados.',
    cargar: async (p) => { const r = await cargarRecepcion(p); return [secPacientes(r), secCitas(r), secTurnos(r), secPagos(r)]; } },
  { id: 'recepcion-pacientes', titulo: 'Pacientes registrados', cargar: async (p) => [secPacientes(await cargarRecepcion(p))] },
  { id: 'recepcion-citas', titulo: 'Citas programadas', cargar: async (p) => [secCitas(await cargarRecepcion(p))] },
  { id: 'recepcion-turnos', titulo: 'Turnos emitidos', cargar: async (p) => [secTurnos(await cargarRecepcion(p))] },
  { id: 'recepcion-pagos', titulo: 'Pagos registrados', cargar: async (p) => [secPagos(await cargarRecepcion(p))] },
];

export default function ReportesRecepcionPage() {
  return (
    <ReportePanel
      reportes={REPORTES}
      encabezado={<PageHeader icon={ClipboardList} title="Reportes de Recepción" subtitle="Pacientes registrados, citas programadas, turnos emitidos y pagos registrados" />}
    />
  );
}
