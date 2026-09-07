import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

const AZUL = '#1e5a8a';
const VERDE = '#1f7a5c';
const GRIS_CLARO = '#f4f6f8';
const BORDE = '#d0d7de';
const TINTA = '#111827';

export const COLORES = { azul: AZUL, verde: VERDE, grisClaro: GRIS_CLARO, borde: BORDE, tinta: TINTA };

let logoCache: string | null = null;

async function obtenerLogo(): Promise<string> {
  if (logoCache) return logoCache;
  try {
    const res = await fetch('/logo.jpg');
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    logoCache = dataUrl;
    return dataUrl;
  } catch {
    return '';
  }
}

export function encabezadoInstitucional(
  logo: string,
  opts: {
    titulo?: string;
    subtitulo?: string;
    dataDerecha?: { label: string; value?: string }[];
  } = {}
): Content {
  const derecha: object[] = (opts.dataDerecha || []).map((d) => ({
    text: [
      { text: `${d.label}: `, color: '#6b7280' },
      { text: d.value || '—', bold: true, color: TINTA },
    ],
    alignment: 'right',
    fontSize: 8.5,
    margin: [0, 1, 0, 1],
  }));

  const filas: object = {
    table: {
      widths: [110, '*', 130],
      body: [
        [
          logo ? { image: logo, width: 88, height: 88, fit: [88, 88], margin: [0, 0, 4, 0] } : {},
          {
            stack: [
              { text: 'CLÍNICA SANTA ISABEL', fontSize: 17, bold: true, color: AZUL, margin: [0, 6, 0, 1] },
              { text: 'SISTEMA DE GESTIÓN HOSPITALARIA', fontSize: 8, color: VERDE, bold: true, characterSpacing: 1, margin: [0, 0, 0, 6] },
              { text: 'Bolívar esq. Tarapacá · Tel. 68283500 · 61813407', fontSize: 7.5, color: '#6b7280', margin: [0, 0, 0, 1] },
              { text: 'Oruro · Bolivia · NIT 40123456-7', fontSize: 7.5, color: '#6b7280' },
            ],
          },
          derecha.length ? { stack: derecha, margin: [6, 4, 0, 0] } : {},
        ],
      ],
    },
    layout: 'noBorders',
  };

  const titulo =
    opts.titulo || opts.subtitulo
      ? {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    ...(opts.titulo
                      ? [{ text: opts.titulo, fontSize: 13, bold: true, color: TINTA, alignment: 'center', margin: [0, 2, 0, 1] }]
                      : []),
                    ...(opts.subtitulo
                      ? [{ text: opts.subtitulo, fontSize: 8.5, color: '#4b5563', alignment: 'center', margin: [0, 0, 0, 2] }]
                      : []),
                  ],
                  margin: [0, 8, 0, 4],
                },
              ],
            ],
          },
          layout: 'noBorders',
        }
      : null;

  return {
    stack: [
      filas,
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.6, lineColor: AZUL }],
        margin: [0, 6, 0, 0],
      },
      ...(titulo ? [titulo] : []),
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.6, lineColor: BORDE },
        ],
        margin: [0, 4, 0, 0],
      },
    ],
    margin: [0, 0, 0, 14],
  };
}

export function tablaInformacionFilas(rows: { label: string; value?: string }[]): Content {
  const body: object[][] = [];
  const mitad = Math.ceil(rows.length / 2);
  for (let i = 0; i < mitad; i++) {
    const a = rows[i];
    const b = rows[i + mitad];
    body.push([
      { text: a?.label || '', background: GRIS_CLARO, bold: true, color: '#374151', fontSize: 9 },
      { text: a?.value || '—', fontSize: 9, color: TINTA },
      { text: b?.label || '', background: GRIS_CLARO, bold: true, color: '#374151', fontSize: 9 },
      { text: b?.value || '—', fontSize: 9, color: TINTA },
    ]);
  }
  return {
    table: { widths: [110, '*', 110, '*'], body },
    layout: {
      hLineWidth: () => 0.6,
      vLineWidth: () => 0.6,
      hLineColor: () => BORDE,
      vLineColor: () => BORDE,
      paddingLeft: () => 7,
      paddingRight: () => 7,
      paddingTop: () => 5,
      paddingBottom: () => 5,
    },
    margin: [0, 0, 0, 14],
  };
}

export function tituloSeccion(texto: string): Content {
  return {
    table: {
      widths: ['*'],
      body: [[{ text: texto, fontSize: 10, bold: true, color: '#ffffff' }]],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      fillColor: () => AZUL,
      paddingTop: () => 5,
      paddingBottom: () => 5,
      paddingLeft: () => 8,
      paddingRight: () => 8,
    },
    margin: [0, 4, 0, 8],
  };
}

export function crearDocumentoPdf(contenido: Content, opts: { titulo?: string; filename?: string; pageSize?: string }) {
  const doc: TDocumentDefinitions = {
    pageSize: (opts.pageSize as string) || 'LETTER',
    pageMargins: [40, 40, 40, 50],
    content: contenido,
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: `Clínica Santa Isabel · ${new Date().toLocaleDateString('es-ES')}`, fontSize: 7.5, color: '#9ca3af' },
        { text: `Página ${currentPage} de ${pageCount}`, fontSize: 7.5, color: '#9ca3af', alignment: 'right' },
      ],
      margin: [40, 6, 40, 0],
    }),
  };
  return { doc, filename: opts.filename || 'documento.pdf' };
}

export function descargarPdf(doc: TDocumentDefinitions, filename: string) {
  pdfMake.createPdf(doc as any).download(filename);
}

export { obtenerLogo };
export default pdfMake;
