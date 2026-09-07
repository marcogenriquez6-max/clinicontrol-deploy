import { obtenerLogo, descargarPdf, COLORES } from './pdfkit';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { numeroTurno } from './turno.utils';

export interface TurnoPdfData {
  numero: number;
  prefijo?: string;
  pacienteNombre: string;
  pacienteCI?: string;
  medicoNombre?: string;
  especialidad?: string;
  consultorio?: string;
  monto: number;
  fechaProgramada?: string;
  horaProgramada?: string;
}

const fechaTurno = (t: TurnoPdfData) => {
  if (t.fechaProgramada) {
    const f = t.fechaProgramada.slice(0, 10).split('-').reverse().join('/');
    return f + (t.horaProgramada ? ` · ${t.horaProgramada}` : '');
  }
  const ahora = new Date();
  return ahora.toLocaleDateString('es-BO') + ' · ' + ahora.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
};

export async function generarTicketPdf(turno: TurnoPdfData, filename = 'ticket.pdf') {
  const logo = await obtenerLogo();

  const linea = () => ({
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 455, y2: 0, lineWidth: 0.8, lineColor: '#444', dash: { length: 3 } }],
    margin: [0, 8, 0, 8],
  });

  const contenido: Content[] = [
    {
      stack: [
        logo ? { image: logo, width: 70, height: 70, alignment: 'center' } : {},
        { text: 'CLÍNICA SANTA ISABEL', fontSize: 13, bold: true, alignment: 'center', color: COLORES.azul, margin: [0, 4, 0, 1] },
        { text: 'NIT: 40123456-7', fontSize: 8, alignment: 'center', color: '#444' },
        { text: 'Bolívar esq. Tarapacá · Tel. 68283500 · 61813407', fontSize: 7.5, alignment: 'center', color: '#555' },
      ],
    },
    linea(),
    { text: 'TURNO', fontSize: 8, alignment: 'center', characterSpacing: 3, color: '#666' },
    { text: numeroTurno(turno.numero, turno.prefijo), fontSize: 46, bold: true, alignment: 'center', color: '#111' },
    { text: fechaTurno(turno), fontSize: 8, alignment: 'center', color: '#333' },
    linea(),
    {
      table: {
        widths: [110, '*'],
        body: [
          [{ text: 'PACIENTE', bold: true, fontSize: 8, color: '#555' }, { text: turno.pacienteNombre, fontSize: 8, bold: true }],
          ...(turno.pacienteCI ? [{ text: 'C.I.', bold: true, fontSize: 8, color: '#555' }, { text: turno.pacienteCI, fontSize: 8 }] : []),
          ...(turno.medicoNombre ? [{ text: 'MÉDICO', bold: true, fontSize: 8, color: '#555' }, { text: turno.medicoNombre, fontSize: 8 }] : []),
          ...(turno.especialidad ? [{ text: 'ESPECIALIDAD', bold: true, fontSize: 8, color: '#555' }, { text: turno.especialidad, fontSize: 8 }] : []),
          ...(turno.consultorio ? [{ text: 'CONSULTORIO', bold: true, fontSize: 8, color: '#555' }, { text: turno.consultorio, fontSize: 8 }] : []),
        ],
      },
      layout: 'noBorders',
    },
    linea(),
    {
      table: {
        widths: ['*', '*'],
        body: [
          [
            { text: 'FORMA DE PAGO', fontSize: 8, color: '#555' },
            { text: 'EFECTIVO', fontSize: 8, alignment: 'right' },
          ],
          [
            { text: 'TOTAL BS.', bold: true, fontSize: 10 },
            { text: Number(turno.monto).toFixed(2), bold: true, fontSize: 10, alignment: 'right' },
          ],
        ],
      },
      layout: 'noBorders',
    },
    { fontSize: 8, alignment: 'center', text: '################################', color: '#888', margin: [0, 8, 0, 2] },
    { text: numeroTurno(turno.numero, turno.prefijo).replace(/-/g, ''), fontSize: 9, alignment: 'center', characterSpacing: 3, margin: [0, 0, 0, 4] },
    linea(),
    { text: 'Será llamado por pantalla y audio.\nConserve este ticket.', fontSize: 8, alignment: 'center', lineHeight: 1.4, color: '#333' },
    { text: 'Gracias por su preferencia', fontSize: 8, alignment: 'center', color: '#777', margin: [0, 4, 0, 0] },
  ];

  const doc: TDocumentDefinitions = {
    pageSize: { width: 226, height: 510 },
    pageMargins: [18, 16, 18, 16],
    content: contenido,
    defaultStyle: { font: 'Roboto' },
  };
  descargarPdf(doc, filename);
}

export default generarTicketPdf;
