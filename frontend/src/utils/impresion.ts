import { configuracionService } from '../api/configuracion.service';
import { reportesService } from '../api/reportes.service';
import type { ClinicaInfo } from '../types';

let clinicaCache: ClinicaInfo | null = null;

export async function obtenerClinica(): Promise<ClinicaInfo> {
  if (clinicaCache) return clinicaCache;
  try {
    const res = await configuracionService.getClinica();
    clinicaCache = (res.data ?? res) as ClinicaInfo;
  } catch {
    clinicaCache = { nombre: 'Clínica Santa Isabel', direccion: 'Oruro, Bolivia', telefono: '', nit: '' };
  }
  return clinicaCache;
}

export function invalidarClinica() {
  clinicaCache = null;
}

/** Convierte a Date tratando "YYYY-MM-DD" como fecha local (no UTC). */
export function aFecha(v: string | Date | number): Date {
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00:00`) : new Date(v);
}

export const fmtFecha = (v?: string | Date | null, conHora = false): string => {
  if (!v) return '—';
  const d = aFecha(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const f = d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  if (!conHora) return f;
  return `${f} ${d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}`;
};

export const fmtBs = (n?: number | string | null): string =>
  `${Number(n ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`;

export function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface ColumnaImpresion<T = Record<string, unknown>> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  format?: (fila: T) => string;
}

export function tablaHtml<T extends Record<string, unknown>>(
  columnas: ColumnaImpresion<T>[],
  filas: T[],
  vacio = 'Sin registros en el período',
): string {
  if (!filas.length) return `<p class="vacio">${esc(vacio)}</p>`;
  const head = columnas
    .map((c) => `<th style="text-align:${c.align ?? 'left'}">${esc(c.header)}</th>`)
    .join('');
  const body = filas
    .map(
      (f) =>
        `<tr>${columnas
          .map(
            (c) =>
              `<td style="text-align:${c.align ?? 'left'}">${esc(
                c.format ? c.format(f) : (f[c.key] as unknown),
              )}</td>`,
          )
          .join('')}</tr>`,
    )
    .join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

export function resumenHtml(items: { label: string; value: string | number }[]): string {
  if (!items.length) return '';
  return `<div class="resumen">${items
    .map((i) => `<div class="kpi"><span class="v">${esc(i.value)}</span><span class="l">${esc(i.label)}</span></div>`)
    .join('')}</div>`;
}

export function encabezadoHtml(clinica: ClinicaInfo, titulo: string, subtitulo?: string): string {
  return `
  <header class="enc">
    <div class="marca">
      <img src="/logo.jpg" alt="" onerror="this.style.display='none'" />
      <div>
        <div class="sistema">CLINICONTROL</div>
        <div class="clinica">${esc(clinica.nombre).toUpperCase()}</div>
        <div class="datos">${esc(clinica.direccion)}${clinica.telefono ? ' · Tel. ' + esc(clinica.telefono) : ''}${clinica.nit ? ' · NIT ' + esc(clinica.nit) : ''}</div>
      </div>
    </div>
    <h1>${esc(titulo)}</h1>
    ${subtitulo ? `<p class="sub">${esc(subtitulo)}</p>` : ''}
  </header>`;
}

const CSS_BASE = `
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 18mm 16mm; font-size: 12px; }
  .enc { border-bottom: 2px solid #1e5a8a; padding-bottom: 8px; margin-bottom: 14px; }
  .marca { display: flex; align-items: center; gap: 12px; }
  .marca img { width: 56px; height: 56px; object-fit: contain; }
  .sistema { font-size: 10px; letter-spacing: 3px; color: #1f7a5c; font-weight: 700; }
  .clinica { font-size: 18px; font-weight: 700; color: #1e5a8a; }
  .datos { font-size: 10px; color: #555; }
  h1 { font-size: 16px; margin: 12px 0 2px; text-align: center; letter-spacing: 1px; }
  .sub { text-align: center; margin: 0; color: #444; font-size: 11px; }
  h2 { font-size: 13px; margin: 18px 0 6px; color: #1e5a8a; border-left: 4px solid #1e5a8a; padding-left: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 10px; font-size: 11px; }
  th { background: #eef3f8; border: 1px solid #c9d3de; padding: 5px 6px; font-weight: 700; }
  td { border: 1px solid #d9e0e8; padding: 4px 6px; vertical-align: top; }
  tr:nth-child(even) td { background: #fafbfc; }
  .resumen { display: flex; gap: 10px; flex-wrap: wrap; margin: 6px 0 8px; }
  .kpi { border: 1px solid #c9d3de; border-radius: 6px; padding: 6px 12px; min-width: 110px; background: #f7f9fb; }
  .kpi .v { display: block; font-size: 16px; font-weight: 700; color: #111; }
  .kpi .l { display: block; font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: .5px; }
  .vacio { color: #777; font-style: italic; margin: 4px 0 10px; }
  footer { margin-top: 18px; border-top: 1px solid #ccc; padding-top: 6px; font-size: 10px; color: #666; display: flex; justify-content: space-between; }
  .firma { margin-top: 40px; display: flex; justify-content: flex-end; }
  .firma div { text-align: center; min-width: 220px; border-top: 1px solid #111; padding-top: 4px; font-size: 11px; }
  @page { size: A4; margin: 10mm; }
`;

const CSS_TICKET = `
  * { box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; color: #000; margin: 0; padding: 6mm 5mm; font-size: 12px; width: 80mm; }
  .linea { border-top: 1px dashed #000; margin: 6px 0; }
  .c { text-align: center; }
  .b { font-weight: 700; }
  .fila { display: flex; justify-content: space-between; gap: 8px; }
  .big { font-size: 18px; font-weight: 700; }
  .xl { font-size: 30px; font-weight: 700; letter-spacing: 2px; }
  @page { size: 80mm auto; margin: 0; }
`;

export interface OpcionesImpresion {
  formato?: 'a4' | 'ticket';
  /** Se registra en auditoría como "imprimió reporte/documento". */
  registrar?: { reporte: string; detalle?: string };
  usuario?: string;
}

/**
 * Abre el diálogo de impresión del navegador con el HTML indicado.
 * Usa una ventana nueva sin scripts (compatible con la CSP del sitio).
 */
export function imprimirHtml(titulo: string, cuerpoHtml: string, opts: OpcionesImpresion = {}): boolean {
  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) return false;
  const css = opts.formato === 'ticket' ? CSS_TICKET : CSS_BASE;
  const pie =
    opts.formato === 'ticket'
      ? ''
      : `<footer><span>Generado por CliniControl${opts.usuario ? ' · ' + esc(opts.usuario) : ''}</span><span>${esc(
          fmtFecha(new Date(), true),
        )}</span></footer>`;
  win.document.open();
  win.document.write(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>${css}</style></head><body>${cuerpoHtml}${pie}</body></html>`,
  );
  win.document.close();
  const lanzar = () => {
    try {
      win.focus();
      win.print();
    } catch {
      /* el usuario puede imprimir manualmente desde la ventana */
    }
  };
  if (win.document.readyState === 'complete') setTimeout(lanzar, 250);
  else win.addEventListener('load', () => setTimeout(lanzar, 250));
  if (opts.registrar) {
    reportesService.registrarImpresion(opts.registrar.reporte, opts.registrar.detalle).catch(() => {});
  }
  return true;
}

export interface SeccionReporte<T extends Record<string, unknown> = Record<string, unknown>> {
  titulo: string;
  resumen?: { label: string; value: string | number }[];
  columnas?: ColumnaImpresion<T>[];
  filas?: T[];
  vacio?: string;
}

/** Arma un reporte A4 completo (encabezado + secciones) y lo imprime. */
export async function imprimirReporte(
  titulo: string,
  subtitulo: string,
  secciones: SeccionReporte[],
  opts: OpcionesImpresion = {},
): Promise<boolean> {
  const clinica = await obtenerClinica();
  const cuerpo = secciones
    .map(
      (s) =>
        `<section><h2>${esc(s.titulo)}</h2>${resumenHtml(s.resumen ?? [])}${
          s.columnas ? tablaHtml(s.columnas, s.filas ?? [], s.vacio) : ''
        }</section>`,
    )
    .join('');
  return imprimirHtml(titulo, encabezadoHtml(clinica, titulo, subtitulo) + cuerpo, {
    ...opts,
    registrar: opts.registrar ?? { reporte: titulo, detalle: subtitulo },
  });
}

export function periodoTexto(fechaInicio?: string, fechaFin?: string): string {
  const a = fechaInicio ? fmtFecha(fechaInicio + 'T00:00:00') : 'inicio del mes';
  const b = fechaFin ? fmtFecha(fechaFin + 'T00:00:00') : 'hoy';
  return `Período: ${a} al ${b}`;
}
