import { esc, fmtBs, fmtFecha, imprimirHtml, obtenerClinica } from './impresion';
import type { Pago } from '../types';
import { numeroTurno } from './turno.utils';

/**
 * Recibo de atención (pago simple en efectivo), formato ticket 80 mm,
 * con el contenido indicado en el documento de grado.
 */
export async function imprimirRecibo(pago: Pago, usuario?: string): Promise<boolean> {
  const c = await obtenerClinica();
  const html = `
    <div class="c b">CLINICONTROL</div>
    <div class="c big">${esc(c.nombre).toUpperCase()}</div>
    <div class="c">${esc(c.direccion)}</div>
    ${c.telefono ? `<div class="c">Tel. ${esc(c.telefono)}</div>` : ''}
    ${c.nit ? `<div class="c">NIT ${esc(c.nit)}</div>` : ''}
    <div class="linea"></div>
    <div class="c b">RECIBO DE ATENCIÓN</div>
    <div class="c">N° ${esc(pago.numeroRecibo)}</div>
    <div class="linea"></div>
    <div><span class="b">Paciente:</span><br/>${esc(pago.pacienteNombre)}</div>
    <div style="margin-top:4px"><span class="b">CI:</span> ${esc(pago.pacienteCI || '—')}</div>
    ${pago.turnoNumero ? `<div style="margin-top:4px"><span class="b">Turno:</span> ${esc(numeroTurno(pago.turnoNumero, pago.turnoPrefijo))}</div>` : ''}
    <div style="margin-top:4px"><span class="b">Servicio:</span><br/>${esc(pago.concepto)}</div>
    <div class="linea"></div>
    <div class="fila big"><span>Monto:</span><span>${esc(fmtBs(pago.monto))}</span></div>
    <div class="fila"><span>Forma de pago:</span><span>EFECTIVO</span></div>
    <div class="fila"><span>Fecha:</span><span>${esc(fmtFecha(pago.fecha, true))}</span></div>
    <div class="linea"></div>
    <div class="c xl">${pago.estado === 'anulado' ? 'ANULADO' : 'PAGADO'}</div>
    ${pago.estado === 'anulado' && pago.motivoAnulacion ? `<div class="c">${esc(pago.motivoAnulacion)}</div>` : ''}
    <div class="linea"></div>
    <div class="c">Atendido por: ${esc(usuario ?? pago.usuarioNombre ?? '')}</div>
    <div class="c" style="margin-top:6px">Conserve este recibo para su atención.</div>
    <div class="c">Gracias por su preferencia</div>
  `;
  return imprimirHtml(`Recibo ${pago.numeroRecibo}`, html, {
    formato: 'ticket',
    registrar: { reporte: 'recibo', detalle: `${pago.numeroRecibo} · ${pago.pacienteNombre}` },
  });
}
