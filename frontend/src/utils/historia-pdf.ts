import { encabezadoInstitucional, obtenerLogo, descargarPdf, crearDocumentoPdf, tituloSeccion, tablaInformacionFilas, COLORES } from './pdfkit';
import type { Content } from 'pdfmake/interfaces';

const getValue = (obj: any, ...keys: string[]) => {
  for (const key of keys) {
    const v = obj?.[key];
    if (v !== undefined && v !== null) return v;
  }
  return null;
};

const fmtFecha = (f: any) => {
  if (!f) return '—';
  const d = new Date(f);
  if (Number.isNaN(d.getTime())) return String(f);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

export interface HistoriaClinicaPdfData {
  paciente?: any;
  perfil?: any;
  alergias?: any[];
  cirugias?: any[];
  historial?: any[];
}

export async function generarHistoriaClinicaPdf(data: HistoriaClinicaPdfData, filename = 'historia-clinica.pdf') {
  const logo = await obtenerLogo();
  const { paciente, perfil, alergias = [], cirugias = [], historial = [] } = data;

  const nombrePaciente = perfil?.nombreCompleto
    || `${paciente?.nombre || ''} ${paciente?.apellido || ''}`.trim()
    || '—';

  const contenido: Content[] = [
    encabezadoInstitucional(logo, {
      titulo: 'HISTORIA CLÍNICA',
      subtitulo: 'Expediente médico del paciente',
      dataDerecha: [
        { label: 'Fecha de emisión', value: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) },
        { label: 'Historia', value: 'Activa' },
      ],
    }),
    tablaInformacionFilas([
      { label: 'Paciente', value: nombrePaciente },
      { label: 'C.I.', value: perfil?.ci || paciente?.ci || '—' },
      { label: 'Edad', value: perfil?.edad ? `${perfil.edad} años` : '—' },
      { label: 'Fecha Nac.', value: fmtFecha(perfil?.fechaNacimiento) },
      { label: 'Género', value: perfil?.genero || '—' },
      { label: 'Grupo Sanguíneo', value: perfil?.grupoSanguineo || '—' },
      { label: 'Teléfono', value: perfil?.telefono || '—' },
      { label: 'Email', value: perfil?.email || '—' },
      ...(perfil?.direccion ? [{ label: 'Dirección', value: perfil.direccion }] : []),
    ]),
  ];

  // Alergias
  contenido.push(tituloSeccion('Alergias'));
  if (!alergias.length) {
    contenido.push({ text: 'No se registraron alergias.', fontSize: 9.5, color: '#6b7280', margin: [0, 0, 0, 10] });
  } else {
    const body = alergias.map((alergia) => {
      const a = alergia.alergia || alergia;
      const sev = alergia.severidad || a.severidad || 'leve';
      return [
        { text: `${a.nombre || alergia.nombre || '—'}`, fontSize: 9, bold: true },
        { text: sev.charAt(0).toUpperCase() + sev.slice(1), fontSize: 9, alignment: 'center' },
      ];
    });
    contenido.push({
      table: { widths: ['*', 120], body: [[
        { text: 'Alergeno', color: '#ffffff', bold: true, fontSize: 9 },
        { text: 'Severidad', color: '#ffffff', bold: true, fontSize: 9, alignment: 'center' },
      ], ...body] },
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
      margin: [0, 0, 0, 14],
    });
  }

  // Cirugías previas
  contenido.push(tituloSeccion('Cirugías Previas'));
  if (!cirugias.length) {
    contenido.push({ text: 'No se registraron cirugías previas.', fontSize: 9.5, color: '#6b7280', margin: [0, 0, 0, 10] });
  } else {
    const body = cirugias.map((c) => [
      { text: c.nombreProcedimiento || '—', fontSize: 9, bold: true },
      { text: c.fechaCirugia || '—', fontSize: 9 },
      { text: c.hospital || '—', fontSize: 9 },
      { text: c.medicoCirujano || '—', fontSize: 9 },
    ]);
    contenido.push({
      table: {
        widths: ['*', 90, '*', '*'],
        body: [[
          { text: 'Procedimiento', color: '#ffffff', bold: true, fontSize: 9 },
          { text: 'Fecha', color: '#ffffff', bold: true, fontSize: 9 },
          { text: 'Hospital', color: '#ffffff', bold: true, fontSize: 9 },
          { text: 'Médico', color: '#ffffff', bold: true, fontSize: 9 },
        ], ...body],
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
      margin: [0, 0, 0, 14],
    });
  }

  // Historial de consultas
  contenido.push(tituloSeccion(`Historial de Consultas (${historial.length})`));
  if (!historial.length) {
    contenido.push({ text: 'No se registraron consultas.', fontSize: 9.5, color: '#6b7280', margin: [0, 0, 0, 10] });
  } else {
    const sorted = [...historial].sort((a, b) => {
      const dA = new Date(a.fecha || a.consultaFecha || a.createdAt || 0).getTime();
      const dB = new Date(b.fecha || b.consultaFecha || b.createdAt || 0).getTime();
      return dB - dA;
    });

    for (const entry of sorted) {
      const fecha = entry.fecha || entry.consultaFecha || entry.createdAt || '';
      const medico = getValue(entry, 'medicoNombre', 'medico?.nombre')
        || [entry.medico?.nombre, entry.medico?.apellido].filter(Boolean).join(' ')
        || '—';
      const especialidad = getValue(entry, 'especialidad', 'medico?.especialidad?.nombre') || '—';
      const motivo = getValue(entry, 'motivoConsulta', 'motivo') || '—';
      const diagnosticos = entry.diagnosticos || [];
      const recetas = entry.recetas || [];

      contenido.push({
        stack: [
          {
            columns: [
              { text: fmtFecha(fecha), bold: true, fontSize: 10, color: COLORES.azul, width: 110 },
              { text: `${medico}${especialidad && especialidad !== '—' ? ` · ${especialidad}` : ''}`, fontSize: 9, bold: true, alignment: 'right' },
            ],
            margin: [0, 6, 0, 2],
          },
          { text: motivo, fontSize: 9, italic: true, color: '#4b5563', margin: [0, 0, 0, 4] },
          ...(diagnosticos.length
            ? [{
              stack: (diagnosticos as any[]).map((dx: any) => ({
                text: [
                  { text: '• ', color: COLORES.azul },
                  { text: dx.descripcion || dx.diagnostico || '—', fontSize: 9 },
                  ...(dx.cie10?.codigo ? [{ text: `  [${dx.cie10.codigo}]`, fontSize: 8, color: '#6b7280' }] : []),
                  ...(dx.tipo ? [{ text: `  (${dx.tipo})`, fontSize: 8, color: '#9ca3af' }] : []),
                ],
                fontSize: 9,
                margin: [0, 1, 0, 1],
              })),
            }]
            : []),
          ...(recetas.length
            ? [{
              text: `Recetas: ${recetas.length}`, fontSize: 8.5, color: '#6b7280', margin: [4, 2, 0, 0],
            }]
            : []),
        ],
        margin: [0, 0, 0, 10],
      });
    }
  }

  // Pie de firma
  contenido.push({
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.8, lineColor: COLORES.borde }],
    margin: [0, 12, 0, 8],
  });
  contenido.push({
    columns: [
      { width: '*', stack: [{ text: '_________________________', fontSize: 10, margin: [0, 20, 0, 2] }, { text: 'Médico de cabecera', fontSize: 9, color: '#4b5563' }] },
      { width: '*', stack: [{ text: '_________________________', fontSize: 10, alignment: 'right', margin: [0, 20, 0, 2] }, { text: 'Firma del paciente', fontSize: 9, color: '#4b5563', alignment: 'right' }] },
    ],
  });

  const { doc, filename: f } = crearDocumentoPdf(contenido, { filename });
  descargarPdf(doc, f);
}

export default generarHistoriaClinicaPdf;
