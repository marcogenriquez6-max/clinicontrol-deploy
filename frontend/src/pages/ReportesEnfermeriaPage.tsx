import { ClipboardList } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import ReportePanel, { type ReporteDefinicion } from '../components/reportes/ReportePanel';
import { reportesService } from '../api/reportes.service';
import { objeto } from '../utils/api.utils';
import { fmtFecha } from '../utils/impresion';

type Fila = Record<string, unknown>;

const REPORTES: ReporteDefinicion[] = [
  {
    id: 'reporte-triaje',
    titulo: 'Reporte de Triaje',
    descripcion: 'Triajes realizados, clasificación ESI y pacientes atendidos en el período.',
    cargar: async (p) => {
      const r = objeto<{ total: number; atendidos: number; porNivel: { nivel: number; total: number }[]; lista: Fila[] }>(await reportesService.triaje(p));
      return [
        {
          titulo: 'Resumen',
          resumen: [
            { label: 'Triajes realizados', value: r.total },
            { label: 'Pacientes atendidos', value: r.atendidos },
            ...r.porNivel.map((n) => ({ label: `ESI-${n.nivel}`, value: n.total })),
          ],
        },
        {
          titulo: 'Clasificación ESI',
          columnas: [
            { key: 'nivel', header: 'Nivel', format: (f) => `ESI-${f.nivel}` },
            { key: 'total', header: 'Pacientes', align: 'right' },
            { key: 'pct', header: '%', align: 'right', format: (f) => (r.total ? `${Math.round((Number(f.total) / r.total) * 100)}%` : '0%') },
          ],
          filas: r.porNivel as unknown as Fila[],
        },
        {
          titulo: 'Triajes realizados',
          columnas: [
            { key: 'fecha', header: 'Fecha', format: (f) => fmtFecha(f.fecha as string, true) },
            { key: 'paciente', header: 'Paciente' },
            { key: 'ci', header: 'CI' },
            { key: 'esi', header: 'ESI', align: 'center', format: (f) => `ESI-${f.esi}` },
            { key: 'temperatura', header: 'T°', align: 'right' },
            { key: 'presionArterial', header: 'PA' },
            { key: 'frecuenciaCardiaca', header: 'FC', align: 'right' },
            { key: 'saturacion', header: 'SpO₂', align: 'right' },
            { key: 'estado', header: 'Estado' },
            { key: 'enfermera', header: 'Registró' },
          ],
          filas: r.lista,
        },
      ];
    },
  },
];

export default function ReportesEnfermeriaPage() {
  return (
    <ReportePanel
      reportes={REPORTES}
      encabezado={<PageHeader icon={ClipboardList} title="Reportes de Enfermería" subtitle="Triajes realizados, clasificación ESI y pacientes atendidos" />}
    />
  );
}
