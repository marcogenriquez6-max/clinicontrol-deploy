import { encabezadoInstitucional, obtenerLogo, descargarPdf, crearDocumentoPdf, tituloSeccion, tablaInformacionFilas, COLORES } from './pdfkit';
import type { Content } from 'pdfmake/interfaces';

export interface ConsultaPdfData {
  paciente?: string;
  medico?: string;
  especialidad?: string;
  tipo?: string;
  turnoNumero?: string;
  motivoConsulta?: string;
  sintomas?: string;
  enfermedadActual?: string;
  examenFisico?: string;
  evaluacion?: string;
  planTratamiento?: string;
  indicaciones?: string;
  signosVitales: Array<{ label: string; value?: string }>;
  diagnosticos: Array<{ descripcion: string; tipo: string; cronico: boolean }>;
}

export async function generarConsultaPdf(data: ConsultaPdfData, filename = 'reporte-consulta.pdf') {
  const logo = await obtenerLogo();
  const contenido: Content[] = [
    encabezadoInstitucional(logo, {
      titulo: 'REPORTE DE CONSULTA MÉDICA',
      subtitulo: data.tipo || '',
      dataDerecha: [
        { label: 'Fecha', value: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) },
        { label: 'Hora', value: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) },
        ...(data.turnoNumero ? [{ label: 'Turno', value: `#${data.turnoNumero}` }] : []),
      ],
    }),
    tablaInformacionFilas([
      { label: 'Paciente', value: data.paciente || '—' },
      { label: 'Médico', value: data.medico || '—' },
      { label: 'Especialidad', value: data.especialidad || '—' },
      { label: 'Tipo de consulta', value: data.tipo || '—' },
    ]),
  ];

  if (data.motivoConsulta || data.sintomas || data.enfermedadActual) {
    contenido.push(
      tituloSeccion('S - Subjetivo'),
      {
        table: {
          widths: [140, '*'],
          body: [
            ['Motivo de Consulta', data.motivoConsulta || '—'],
            ['Síntomas', data.sintomas || '—'],
            ['Enfermedad Actual', data.enfermedadActual || '—'],
          ].map((r) => [
            { text: r[0], background: '#f4f6f8', bold: true, color: '#374151', fontSize: 9.5, width: 140 },
            { text: r[1], fontSize: 9.5, color: '#111827' },
          ]),
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => COLORES.borde,
          vLineColor: () => COLORES.borde,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
        margin: [0, 0, 0, 12],
      }
    );
  }

  if (data.signosVitales.some((s) => s.value)) {
    contenido.push(
      tituloSeccion('O - Objetivo (Signos Vitales)'),
      {
        table: {
          widths: Array(data.signosVitales.length).fill('*'),
          body: [
            data.signosVitales.map((s) => ({ text: s.label, color: '#ffffff', bold: true, fontSize: 8.5, alignment: 'center' })),
            data.signosVitales.map((s) => ({ text: s.value || '—', fontSize: 9, alignment: 'center', margin: [0, 3, 0, 3] })),
          ],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === 1 ? 1 : 0.4),
          vLineWidth: () => 0.4,
          hLineColor: () => COLORES.borde,
          vLineColor: () => COLORES.borde,
          fillColor: (i: number) => (i === 0 ? COLORES.azul : null),
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
        margin: [0, 0, 0, 12],
      }
    );
  }

  if (data.examenFisico) {
    contenido.push(tituloSeccion('Examen Físico'), { text: data.examenFisico, fontSize: 9.5, margin: [0, 0, 0, 12] });
  }

  contenido.push(tituloSeccion('A - Evaluación y Diagnósticos'));
  if (data.evaluacion) contenido.push({ text: data.evaluacion, fontSize: 9.5, margin: [0, 0, 0, 10] });
  if (data.diagnosticos.length) {
    contenido.push({
      table: {
        widths: ['*', 100, 70],
        body: [
          [
            { text: 'Diagnóstico', color: '#ffffff', bold: true, fontSize: 9, style: 'th' },
            { text: 'Tipo', color: '#ffffff', bold: true, fontSize: 9, style: 'th', alignment: 'center' },
            { text: 'Crónico', color: '#ffffff', bold: true, fontSize: 9, style: 'th', alignment: 'center' },
          ],
          ...data.diagnosticos.map((d) => [
            { text: d.descripcion || '—', fontSize: 9 },
            { text: d.tipo, fontSize: 9, alignment: 'center' },
            { text: d.cronico ? 'Sí' : 'No', fontSize: 9, alignment: 'center' },
          ]),
        ],
      },
      layout: {
        hLineWidth: (i: number) => (i === 0 ? 1 : 0.4),
        vLineWidth: () => 0.4,
        hLineColor: () => COLORES.borde,
        vLineColor: () => COLORES.borde,
        fillColor: (i: number) => (i === 0 ? COLORES.azul : null),
        paddingLeft: () => 7,
        paddingRight: () => 7,
        paddingTop: () => 5,
        paddingBottom: () => 5,
      },
      margin: [0, 0, 0, 12],
    });
  }

  contenido.push(tituloSeccion('P - Plan'));
  if (data.planTratamiento) contenido.push({ text: data.planTratamiento, fontSize: 9.5, margin: [0, 0, 0, 10] });
  if (data.indicaciones) {
    contenido.push(
      { text: 'Indicaciones:', bold: true, fontSize: 9.5, color: '#4b5563', margin: [0, 0, 0, 3] },
      { text: data.indicaciones, fontSize: 9.5, margin: [0, 0, 0, 10] }
    );
  }

  contenido.push({
    columns: [
      { text: '_________________________', width: 150 },
      { text: '', width: '*' },
    ],
    margin: [0, 30, 0, 4],
  });
  contenido.push({
    columns: [
      { text: `${data.medico || 'Médico'}\nFirma y Sello`, width: 150, fontSize: 9 },
      { text: '', width: '*' },
    ],
  });

  const { doc, filename: f } = crearDocumentoPdf(contenido, { filename });
  descargarPdf(doc, f);
}

export default generarConsultaPdf;
