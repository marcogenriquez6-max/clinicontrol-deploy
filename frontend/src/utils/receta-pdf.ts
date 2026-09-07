import { encabezadoInstitucional, obtenerLogo, descargarPdf, crearDocumentoPdf, COLORES } from './pdfkit';
import type { Content } from 'pdfmake/interfaces';

export interface RecetaPdfData {
  paciente?: string;
  medico?: string;
  citaTipoAtencion?: string;
  diagnostico?: string;
  fecha: string;
  instrucciones?: string;
  medicamentos: Array<{
    medNombre?: string;
    nombre?: string;
    medicamento?: { nombre?: string };
    dosis?: string;
    frecuencia?: string;
    duracion?: string;
    cantidad?: number;
    observaciones?: string;
  }>;
}

export async function generarRecetaPdf(receta: RecetaPdfData, filename = 'receta.pdf') {
  const logo = await obtenerLogo();
  const fecha = new Date(receta.fecha);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
  const anio = fecha.getFullYear();

  const medicamentos = receta.medicamentos || [];
  const tablaBody: object[][] = [
    [
      { text: 'N°', style: 'th', alignment: 'center' },
      { text: 'Medicamento', style: 'th' },
      { text: 'Dosis', style: 'th' },
      { text: 'Frecuencia', style: 'th' },
      { text: 'Duración', style: 'th' },
      { text: 'Cant.', style: 'th', alignment: 'center' },
    ],
  ];

  medicamentos.forEach((m, i) => {
    const nombre = m.medNombre || m.nombre || m.medicamento?.nombre || '';
    tablaBody.push([
      { text: String(i + 1), alignment: 'center', fontSize: 9 },
      { text: nombre, bold: true, fontSize: 9 },
      { text: m.dosis || '-', fontSize: 9 },
      { text: m.frecuencia ? `c/${m.frecuencia}` : '-', fontSize: 9 },
      { text: m.duracion || '-', fontSize: 9 },
      { text: String(m.cantidad || 1), alignment: 'center', fontSize: 9 },
    ]);
  });

  const contenido: Content[] = [
    encabezadoInstitucional(logo, {
      subtitulo: 'RECETA MÉDICA',
      dataDerecha: [
        { label: 'Fecha', value: `${dia} de ${mes} de ${anio}` },
        ...(receta.citaTipoAtencion ? [{ label: 'Atención', value: receta.citaTipoAtencion }] : []),
      ],
    }),
    tablaInformacion([
      { label: 'Paciente', value: receta.paciente || '—' },
      { label: 'Médico', value: receta.medico || '—' },
      ...(receta.diagnostico ? [{ label: 'Diagnóstico', value: receta.diagnostico }] : []),
    ]),
    { text: 'R/p.', bold: true, fontSize: 12, margin: [0, 0, 0, 8] },
    {
      table: {
        widths: [30, '*', 65, 70, 60, 34],
        body: tablaBody,
      },
      layout: {
        hLineWidth: (i: number) => (i === 0 || i === 1 ? 1.2 : 0.5),
        vLineWidth: () => 0.4,
        hLineColor: () => COLORES.tinta,
        vLineColor: () => COLORES.borde,
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 5,
        paddingBottom: () => 5,
      },
    },
  ];

  if (receta.instrucciones) {
    contenido.push(
      { text: 'INDICACIONES', style: 'labelSec', margin: [0, 14, 0, 2] },
      { text: receta.instrucciones, fontSize: 10, italics: true, color: '#333', margin: [0, 0, 0, 8] }
    );
  }

  const obs = medicamentos.filter((m) => m.observaciones);
  if (obs.length) {
    contenido.push(
      { text: 'OBSERVACIONES', style: 'labelSec', margin: [0, 4, 0, 2] },
      ...obs.map((m) => ({
        stack: [
          { text: `${m.medNombre || m.nombre || m.medicamento?.nombre || ''}:`, bold: true, fontSize: 9 },
          { text: m.observaciones, fontSize: 9, margin: [6, 1, 0, 3] },
        ],
        margin: [0, 0, 0, 5],
      }))
    );
  }

  contenido.push(
    {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.2, lineColor: COLORES.tinta }],
      margin: [0, 24, 0, 10],
    },
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: `Oruro, ${dia} de ${mes} de ${anio}`, fontSize: 10, margin: [0, 0, 0, 26] },
            { text: '_________________________', fontSize: 10 },
            { text: receta.medico || 'Médico', fontSize: 9, bold: true, margin: [0, 2, 0, 0] },
          ],
        },
        {
          width: '*',
          stack: [
            { text: 'CENTRO MÉDICO "SANTA ISABEL"', fontSize: 9, bold: true, alignment: 'right' },
            { text: 'Bolivar esq. Tarapacá · 68283500 · 61813407', fontSize: 8.5, color: '#555', alignment: 'right', margin: [0, 2, 0, 0] },
          ],
          alignment: 'right',
        },
      ],
    }
  );

  const { doc, filename: f } = crearDocumentoPdf(contenido, { filename });
  doc.styles = {
    th: { color: '#ffffff', fillColor: COLORES.azul },
    labelSec: { fontSize: 9, bold: true, color: COLORES.azul },
  } as any;
  descargarPdf(doc, f);
}

function tablaInformacion(rows: { label: string; value: string }[]): Content {
  const body = rows.map((r) => [
    { text: r.label, background: '#f4f6f8', bold: true, color: '#374151', fontSize: 9, width: 90 },
    { text: r.value, fontSize: 9, color: '#111827' },
  ]);
  return {
    table: { widths: [90, '*'], body },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORES.borde,
      vLineColor: () => COLORES.borde,
      paddingLeft: () => 7,
      paddingRight: () => 7,
      paddingTop: () => 5,
      paddingBottom: () => 5,
    },
    margin: [0, 0, 0, 14],
  };
}

export default generarRecetaPdf;
