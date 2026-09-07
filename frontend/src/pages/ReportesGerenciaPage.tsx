import { ClipboardList } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import ReportePanel, { type ReporteDefinicion } from '../components/reportes/ReportePanel';
import { reportesService } from '../api/reportes.service';
import { objeto } from '../utils/api.utils';
import { fmtFecha } from '../utils/impresion';

type Fila = Record<string, unknown>;
const CAMA_LABEL: Record<string, string> = { disponible: 'Disponible', ocupado: 'Ocupada', reservado: 'Reservada', limpieza: 'En limpieza', mantenimiento: 'Mantenimiento' };

const REPORTES: ReporteDefinicion[] = [
  {
    id: 'gerencia-pacientes', titulo: 'Reporte de Pacientes', descripcion: 'Pacientes registrados, nuevos en el período y activos.',
    cargar: async (p) => {
      const r = objeto<{ registrados: number; nuevos: number; activos: number; inactivos: number; listaNuevos: Fila[]; lista: Fila[] }>(await reportesService.pacientes(p));
      return [
        { titulo: 'Resumen', resumen: [{ label: 'Registrados', value: r.registrados }, { label: 'Nuevos en el período', value: r.nuevos }, { label: 'Activos', value: r.activos }, { label: 'Inactivos', value: r.inactivos }] },
        { titulo: 'Nuevos pacientes', columnas: [{ key: 'fecha', header: 'Registro', format: (f) => fmtFecha(f.fecha as string) }, { key: 'ci', header: 'CI' }, { key: 'nombre', header: 'Paciente' }, { key: 'genero', header: 'Género' }, { key: 'telefono', header: 'Teléfono' }], filas: r.listaNuevos },
        { titulo: 'Pacientes activos', columnas: [{ key: 'ci', header: 'CI' }, { key: 'nombre', header: 'Paciente' }, { key: 'genero', header: 'Género' }, { key: 'telefono', header: 'Teléfono' }, { key: 'registrado', header: 'Registrado', format: (f) => fmtFecha(f.registrado as string) }], filas: r.lista },
      ];
    },
  },
  {
    id: 'gerencia-citas', titulo: 'Reporte de Citas', descripcion: 'Citas programadas, atendidas y canceladas.',
    cargar: async (p) => {
      const r = objeto<{ programadas: number; atendidas: number; canceladas: number; pendientes: number; lista: Fila[] }>(await reportesService.citas(p));
      return [
        { titulo: 'Resumen', resumen: [{ label: 'Programadas', value: r.programadas }, { label: 'Atendidas', value: r.atendidas }, { label: 'Canceladas', value: r.canceladas }, { label: 'Pendientes', value: r.pendientes }] },
        { titulo: 'Detalle de citas', columnas: [{ key: 'fecha', header: 'Fecha', format: (f) => fmtFecha(f.fecha as string) }, { key: 'hora', header: 'Hora' }, { key: 'paciente', header: 'Paciente' }, { key: 'medico', header: 'Médico' }, { key: 'estado', header: 'Estado' }, { key: 'motivoCancelacion', header: 'Motivo cancelación' }], filas: r.lista },
      ];
    },
  },
  {
    id: 'gerencia-medico', titulo: 'Reporte Médico', descripcion: 'Consultas por médico y productividad.',
    cargar: async (p) => {
      const r = objeto<{ totalConsultas: number; lista: Fila[] }>(await reportesService.productividad(p));
      return [{
        titulo: 'Consultas por médico y productividad',
        resumen: [{ label: 'Consultas totales', value: r.totalConsultas }, { label: 'Médicos', value: r.lista.length }],
        columnas: [{ key: 'medico', header: 'Médico' }, { key: 'especialidad', header: 'Especialidad' }, { key: 'consultas', header: 'Consultas', align: 'right' }, { key: 'diagnosticos', header: 'Diagnósticos', align: 'right' }, { key: 'recetas', header: 'Recetas', align: 'right' }, { key: 'promedioDiario', header: 'Promedio/día', align: 'right' }],
        filas: r.lista,
      }];
    },
  },
  {
    id: 'gerencia-hospitalizacion', titulo: 'Reporte de Hospitalización', descripcion: 'Internaciones, altas y ocupación de camas.',
    cargar: async (p) => {
      const r = objeto<{ internados: { total: number; lista: Fila[] }; camas: { total: number; ocupadas: number; disponibles: number; porcentajeOcupacion: number; lista: Fila[] }; altas: { total: number; lista: Fila[] } }>(await reportesService.hospitalizacion(p));
      return [
        { titulo: 'Internaciones vigentes', resumen: [{ label: 'Internados', value: r.internados.total }], columnas: [{ key: 'fechaIngreso', header: 'Ingreso', format: (f) => fmtFecha(f.fechaIngreso as string) }, { key: 'paciente', header: 'Paciente' }, { key: 'cama', header: 'Cama' }, { key: 'servicio', header: 'Servicio' }, { key: 'medico', header: 'Médico' }], filas: r.internados.lista },
        { titulo: 'Altas del período', resumen: [{ label: 'Altas', value: r.altas.total }], columnas: [{ key: 'fechaIngreso', header: 'Ingreso', format: (f) => fmtFecha(f.fechaIngreso as string) }, { key: 'fechaAlta', header: 'Alta', format: (f) => fmtFecha(f.fechaAlta as string) }, { key: 'dias', header: 'Días', align: 'right' }, { key: 'paciente', header: 'Paciente' }, { key: 'medico', header: 'Médico' }], filas: r.altas.lista },
        { titulo: 'Ocupación de camas', resumen: [{ label: 'Camas', value: r.camas.total }, { label: 'Ocupadas', value: r.camas.ocupadas }, { label: 'Disponibles', value: r.camas.disponibles }, { label: 'Ocupación', value: `${r.camas.porcentajeOcupacion}%` }], columnas: [{ key: 'codigo', header: 'Cama' }, { key: 'servicio', header: 'Servicio' }, { key: 'estado', header: 'Estado', format: (f) => CAMA_LABEL[String(f.estado)] ?? String(f.estado) }], filas: r.camas.lista },
      ];
    },
  },
];

export default function ReportesGerenciaPage() {
  return <ReportePanel reportes={REPORTES} encabezado={<PageHeader icon={ClipboardList} title="Reportes de Gerencia" subtitle="Pacientes, citas, producción médica y hospitalización" />} />;
}
