import { ClipboardList } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import ReportePanel, { type ReporteDefinicion } from '../components/reportes/ReportePanel';
import { reportesService } from '../api/reportes.service';
import { objeto } from '../utils/api.utils';
import { fmtFecha, type SeccionReporte } from '../utils/impresion';

type Fila = Record<string, unknown>;
interface Medico {
  consultas: { total: number; lista: Fila[] };
  diagnosticosFrecuentes: { codigo: string; descripcion: string; total: number }[];
  recetas: { total: number; lista: Fila[] };
}
const cargar = async (p: { fechaInicio: string; fechaFin: string }) => objeto<Medico>(await reportesService.medico(p));

const secConsultas = (r: Medico): SeccionReporte => ({
  titulo: 'Consultas realizadas',
  resumen: [{ label: 'Consultas', value: r.consultas.total }],
  columnas: [
    { key: 'fecha', header: 'Fecha', format: (f) => fmtFecha(f.fecha as string) },
    { key: 'paciente', header: 'Paciente' }, { key: 'ci', header: 'CI' }, { key: 'motivo', header: 'Motivo' }, { key: 'diagnosticos', header: 'CIE-10' },
  ],
  filas: r.consultas.lista,
});
const secDiag = (r: Medico): SeccionReporte => ({
  titulo: 'Diagnósticos frecuentes',
  resumen: [{ label: 'Diagnósticos distintos', value: r.diagnosticosFrecuentes.length }],
  columnas: [{ key: 'codigo', header: 'Código' }, { key: 'descripcion', header: 'Descripción' }, { key: 'total', header: 'Casos', align: 'right' }],
  filas: r.diagnosticosFrecuentes as unknown as Fila[],
});
const secRecetas = (r: Medico): SeccionReporte => ({
  titulo: 'Recetas emitidas',
  resumen: [{ label: 'Recetas', value: r.recetas.total }],
  columnas: [
    { key: 'fecha', header: 'Fecha', format: (f) => fmtFecha(f.fecha as string) },
    { key: 'paciente', header: 'Paciente' }, { key: 'medicamentos', header: 'Medicamentos' }, { key: 'estado', header: 'Estado' },
  ],
  filas: r.recetas.lista,
});

const REPORTES: ReporteDefinicion[] = [
  { id: 'medico-completo', titulo: 'Reporte Médico', descripcion: 'Consultas realizadas, diagnósticos frecuentes y recetas emitidas por usted.',
    cargar: async (p) => { const r = await cargar(p); return [secConsultas(r), secDiag(r), secRecetas(r)]; } },
  { id: 'medico-consultas', titulo: 'Consultas realizadas', cargar: async (p) => [secConsultas(await cargar(p))] },
  { id: 'medico-diagnosticos', titulo: 'Diagnósticos frecuentes', cargar: async (p) => [secDiag(await cargar(p))] },
  { id: 'medico-recetas', titulo: 'Recetas emitidas', cargar: async (p) => [secRecetas(await cargar(p))] },
];

export default function ReportesMedicosPage() {
  return <ReportePanel reportes={REPORTES} encabezado={<PageHeader icon={ClipboardList} title="Reportes Médicos" subtitle="Su producción: consultas, diagnósticos frecuentes y recetas" />} />;
}
