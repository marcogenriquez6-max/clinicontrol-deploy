import { useEffect, useState } from 'react';
import { ReceiptText, Printer, Ban, Search } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card, Input, Modal, Badge } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { errMsg } from '../api/errMsg';
import { pagoService } from '../api/pago.service';
import { useAuthStore } from '../store/authStore';
import type { Pago } from '../types';
import { lista, hoyIso } from '../utils/api.utils';
import { fmtBs, fmtFecha, imprimirReporte } from '../utils/impresion';
import { imprimirRecibo } from '../utils/recibo';
import { numeroTurno } from '../utils/turno.utils';

/** Recepción → Recibos: consulta, reimpresión y anulación de recibos de atención. */
export default function RecibosPage() {
  const user = useAuthStore((s) => s.user);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const [desde, setDesde] = useState(hoyIso());
  const [hasta, setHasta] = useState(hoyIso());
  const [q, setQ] = useState('');
  const [anular, setAnular] = useState<Pago | null>(null);
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setPagos(lista<Pago>(await pagoService.getAll({ fechaInicio: desde, fechaFin: hasta, q: q.trim() || undefined, limit: 500 })));
    } catch (e) { toast('error', 'No se pudieron cargar los recibos', errMsg(e)); } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const imprimir = async (p: Pago) => {
    const ok = await imprimirRecibo(p, user?.nombre);
    if (!ok) toast('warning', 'Ventana bloqueada', 'Permita ventanas emergentes para imprimir');
  };

  const confirmarAnulacion = async () => {
    if (!anular) return;
    if (motivo.trim().length < 3) { toast('warning', 'Indique el motivo de la anulación'); return; }
    setGuardando(true);
    try {
      await pagoService.anular(anular.id, motivo.trim());
      toast('success', `Recibo ${anular.numeroRecibo} anulado`, 'La anulación quedó registrada en auditoría');
      setAnular(null); setMotivo('');
      void load();
    } catch (e) { toast('error', 'No se pudo anular', errMsg(e)); } finally { setGuardando(false); }
  };

  const vigentes = pagos.filter((p) => p.estado === 'pagado');
  const total = vigentes.reduce((s, p) => s + Number(p.monto), 0);

  const imprimirListado = () => imprimirReporte(
    'Recibos emitidos',
    `Período: ${fmtFecha(desde + 'T00:00:00')} al ${fmtFecha(hasta + 'T00:00:00')}`,
    [{
      titulo: 'Detalle de recibos',
      resumen: [{ label: 'Recibos vigentes', value: vigentes.length }, { label: 'Anulados', value: pagos.length - vigentes.length }, { label: 'Total cobrado', value: fmtBs(total) }],
      columnas: [
        { key: 'numeroRecibo', header: 'N° Recibo' },
        { key: 'fecha', header: 'Fecha', format: (f) => fmtFecha(f.fecha as string, true) },
        { key: 'pacienteNombre', header: 'Paciente' },
        { key: 'pacienteCI', header: 'CI' },
        { key: 'concepto', header: 'Concepto' },
        { key: 'monto', header: 'Monto', align: 'right', format: (f) => fmtBs(f.monto as number) },
        { key: 'estado', header: 'Estado', format: (f) => String(f.estado).toUpperCase() },
      ],
      filas: pagos as unknown as Record<string, unknown>[],
    }],
    { registrar: { reporte: 'recibos-listado', detalle: `${desde} a ${hasta}` }, usuario: user?.nombre },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ReceiptText}
        title="Recibos"
        subtitle="Comprobantes de pago emitidos. Reimprima o anule con motivo registrado."
        stats={[{ label: 'recibos', value: vigentes.length }, { label: 'total', value: fmtBs(total) }]}
        action={<Button variant="secondary" onClick={imprimirListado} disabled={pagos.length === 0}><Printer className="w-4 h-4" />Imprimir listado</Button>}
      />

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Input label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <Input label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <div className="flex-1 min-w-[220px]"><Input label="Buscar" placeholder="N° recibo, paciente, CI o concepto" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} /></div>
          <Button onClick={load} loading={loading}><Search className="w-4 h-4" />Buscar</Button>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium w-full text-sm">
            <thead><tr><th>N° Recibo</th><th>Fecha</th><th>Paciente</th><th>Servicio</th><th>Turno</th><th className="text-right">Monto</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
            <tbody>
              {pagos.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-[var(--text-tertiary)]">No hay recibos en el período seleccionado</td></tr>}
              {pagos.map((p) => (
                <tr key={p.id} className={p.estado === 'anulado' ? 'opacity-60' : ''}>
                  <td className="font-semibold tabular-nums">{p.numeroRecibo}</td>
                  <td className="tabular-nums whitespace-nowrap">{fmtFecha(p.fecha, true)}</td>
                  <td><p className="font-medium text-[var(--text-primary)]">{p.pacienteNombre}</p><p className="text-xs text-[var(--text-tertiary)]">CI {p.pacienteCI || '—'}</p></td>
                  <td>{p.concepto}</td>
                  <td className="tabular-nums">{p.turnoNumero ? numeroTurno(p.turnoNumero, p.turnoPrefijo) : '—'}</td>
                  <td className="text-right font-semibold tabular-nums">{fmtBs(p.monto)}</td>
                  <td><Badge variant={p.estado === 'pagado' ? 'success' : 'danger'}>{p.estado === 'pagado' ? 'PAGADO' : 'ANULADO'}</Badge></td>
                  <td className="text-right">
                    <div className="inline-flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => imprimir(p)}><Printer className="w-4 h-4" />Imprimir</Button>
                      {p.estado === 'pagado' && <Button size="sm" variant="ghost" onClick={() => { setAnular(p); setMotivo(''); }} className="hover:text-[var(--danger-600)]"><Ban className="w-4 h-4" />Anular</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {pagos.length > 0 && (
              <tfoot><tr className="font-bold"><td colSpan={5} className="text-right">Total vigente</td><td className="text-right tabular-nums">{fmtBs(total)}</td><td colSpan={2} /></tr></tfoot>
            )}
          </table>
        </div>
      </Card>

      <Modal isOpen={!!anular} onClose={() => setAnular(null)} title="Anular recibo" size="sm" accent="danger">
        {anular && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">Se anulará el recibo <strong>{anular.numeroRecibo}</strong> de <strong>{anular.pacienteNombre}</strong> por {fmtBs(anular.monto)}. Si estaba asociado a un turno, este volverá a quedar pendiente de pago.</p>
            <Input label="Motivo de anulación *" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. cobro duplicado" />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setAnular(null)}>Cancelar</Button>
              <Button variant="danger" loading={guardando} onClick={confirmarAnulacion}><Ban className="w-4 h-4" />Anular recibo</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
