import { useEffect, useMemo, useState } from 'react';
import { Banknote, Printer, Search, CheckCircle2, RefreshCw, Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card, Input, Modal, KpiCard } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { errMsg } from '../api/errMsg';
import { pagoService } from '../api/pago.service';
import { useStore } from '../store';
import { useAuthStore } from '../store/authStore';
import type { Pago, TurnoPendientePago, Paciente } from '../types';
import { lista, objeto, hoyIso } from '../utils/api.utils';
import { fmtBs, fmtFecha } from '../utils/impresion';
import { imprimirRecibo } from '../utils/recibo';
import { numeroTurno, horaDe } from '../utils/turno.utils';

/**
 * Recepción → Pagos: registro simple de pago en efectivo asociado a la atención.
 * Sin apertura/cierre de caja ni múltiples métodos de pago (coherente con la tesis).
 */
export default function PagosPage() {
  const user = useAuthStore((s) => s.user);
  const { pacientes, fetchPacientes } = useStore();
  const [pendientes, setPendientes] = useState<TurnoPendientePago[]>([]);
  const [pagosHoy, setPagosHoy] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Confirmación de pago de un turno
  const [objetivo, setObjetivo] = useState<TurnoPendientePago | null>(null);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [reciboEmitido, setReciboEmitido] = useState<Pago | null>(null);

  // Pago sin turno (p. ej. certificado, copia de historia)
  const [manualOpen, setManualOpen] = useState(false);
  const [pacQuery, setPacQuery] = useState('');
  const [pacSel, setPacSel] = useState<Paciente | null>(null);
  const [mConcepto, setMConcepto] = useState('');
  const [mMonto, setMMonto] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [p, h] = await Promise.all([
        pagoService.getPendientes(),
        pagoService.getAll({ fechaInicio: hoyIso(), fechaFin: hoyIso(), limit: 200 }),
      ]);
      setPendientes(lista<TurnoPendientePago>(p));
      setPagosHoy(lista<Pago>(h));
    } catch (e) { toast('error', 'No se pudieron cargar los pagos', errMsg(e)); } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => { fetchPacientes(); void load(); }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirConfirmacion = (t: TurnoPendientePago) => {
    setObjetivo(t);
    setConcepto(t.concepto || 'Consulta Médica');
    setMonto(String(Number(t.monto || 0)));
  };

  const registrar = async () => {
    if (!objetivo) return;
    const m = Number(monto);
    if (!concepto.trim() || Number.isNaN(m) || m <= 0) {
      toast('warning', 'Datos incompletos', 'Indique el concepto y un monto mayor a cero');
      return;
    }
    setGuardando(true);
    try {
      const res = await pagoService.registrar({ turnoId: objetivo.turnoId, concepto: concepto.trim(), monto: m });
      const pago = objeto<Pago>(res);
      setObjetivo(null);
      setReciboEmitido(pago);
      toast('success', `Pago registrado · Recibo ${pago.numeroRecibo}`, `${pago.pacienteNombre} · ${fmtBs(pago.monto)} · PAGADO`);
      void load();
    } catch (e) { toast('error', 'No se pudo registrar el pago', errMsg(e)); } finally { setGuardando(false); }
  };

  const registrarManual = async () => {
    const m = Number(mMonto);
    if (!pacSel?.id || !mConcepto.trim() || Number.isNaN(m) || m <= 0) {
      toast('warning', 'Datos incompletos', 'Seleccione el paciente, el concepto y un monto mayor a cero');
      return;
    }
    setGuardando(true);
    try {
      const pago = objeto<Pago>(await pagoService.registrar({ pacienteId: pacSel.id, concepto: mConcepto.trim(), monto: m }));
      setManualOpen(false); setPacSel(null); setPacQuery(''); setMConcepto(''); setMMonto('');
      setReciboEmitido(pago);
      toast('success', `Pago registrado · Recibo ${pago.numeroRecibo}`);
      void load();
    } catch (e) { toast('error', 'No se pudo registrar el pago', errMsg(e)); } finally { setGuardando(false); }
  };

  const imprimir = async (p: Pago) => {
    const ok = await imprimirRecibo(p, user?.nombre);
    if (!ok) toast('warning', 'Ventana bloqueada', 'Permita ventanas emergentes para imprimir el recibo');
  };

  const pendientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pendientes;
    return pendientes.filter((p) => `${p.pacienteNombre} ${p.pacienteCI} ${numeroTurno(p.numero, p.prefijo)} ${p.concepto}`.toLowerCase().includes(q));
  }, [pendientes, busqueda]);

  const pacientesFiltrados = useMemo(() => {
    const q = pacQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return pacientes.filter((p) => `${p.nombre} ${p.apellido} ${p.ci}`.toLowerCase().includes(q)).slice(0, 8);
  }, [pacientes, pacQuery]);

  const totalHoy = pagosHoy.filter((p) => p.estado === 'pagado').reduce((s, p) => s + Number(p.monto), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Banknote}
        title="Pagos"
        subtitle="Registro de pago en efectivo por atención. Al registrar, se emite el recibo."
        stats={[{ label: 'pendientes hoy', value: pendientes.length }, { label: 'cobrados hoy', value: pagosHoy.filter((p) => p.estado === 'pagado').length }]}
        action={<div className="flex gap-2"><Button variant="secondary" onClick={load} loading={loading}><RefreshCw className="w-4 h-4" />Actualizar</Button><Button onClick={() => setManualOpen(true)}><Plus className="w-4 h-4" />Pago sin turno</Button></div>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard icon={Banknote} label="Total cobrado hoy" value={fmtBs(totalHoy)} color="emerald" />
        <KpiCard icon={CheckCircle2} label="Recibos emitidos hoy" value={pagosHoy.filter((p) => p.estado === 'pagado').length} color="blue" />
        <KpiCard icon={Search} label="Pendientes de pago" value={pendientes.length} color={pendientes.length ? 'amber' : 'cyan'} badge={fmtBs(pendientes.reduce((s, p) => s + Number(p.monto), 0))} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Card className="xl:col-span-3" title="Turnos pendientes de pago" subtitle="Turnos generados hoy que aún no registran su pago">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por paciente, CI o turno..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary-500)]" />
          </div>
          {pendientesFiltrados.length === 0 ? (
            <div className="text-center py-10"><CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--success-500)' }} /><p className="text-sm text-[var(--text-tertiary)]">{busqueda ? 'Sin resultados' : 'No hay pagos pendientes. Todo al día.'}</p></div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {pendientesFiltrados.map((t) => (
                <div key={t.turnoId} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-16 h-10 rounded-md flex items-center justify-center text-sm font-bold text-white tabular-nums shrink-0" style={{ backgroundColor: 'var(--warning-500)' }}>{numeroTurno(t.numero, t.prefijo)}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[var(--text-primary)] truncate">{t.pacienteNombre} <span className="text-xs text-[var(--text-tertiary)]">CI {t.pacienteCI || '—'}</span></p>
                      <p className="text-xs text-[var(--text-tertiary)] truncate">{t.concepto} · {t.medicoNombre} · {t.horaProgramada || horaDe(t.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-sm tabular-nums text-[var(--text-primary)]">{fmtBs(t.monto)}</span>
                    <Button size="sm" onClick={() => abrirConfirmacion(t)}><Banknote className="w-4 h-4" />Registrar pago</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="xl:col-span-2" title="Pagos de hoy" subtitle={`${pagosHoy.length} recibo(s) · ${fmtBs(totalHoy)}`}>
          {pagosHoy.length === 0 ? (
            <p className="text-sm text-center py-10 text-[var(--text-tertiary)]">Aún no hay pagos registrados hoy</p>
          ) : (
            <div className="divide-y divide-[var(--border-secondary)] max-h-[520px] overflow-y-auto">
              {pagosHoy.map((p) => (
                <div key={p.id} className={`py-2.5 flex items-center justify-between gap-3 ${p.estado === 'anulado' ? 'opacity-60' : ''}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.numeroRecibo} · {p.pacienteNombre}</p>
                    <p className="text-xs text-[var(--text-tertiary)] truncate">{p.concepto} · {fmtFecha(p.fecha, true)}{p.estado === 'anulado' ? ' · ANULADO' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold tabular-nums">{fmtBs(p.monto)}</span>
                    <Button size="sm" variant="ghost" icon onClick={() => imprimir(p)} aria-label="Imprimir recibo"><Printer className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Confirmar pago de turno */}
      <Modal isOpen={!!objetivo} onClose={() => setObjetivo(null)} title="Registrar pago en efectivo" size="md" accent="success">
        {objetivo && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[var(--info-200)] bg-[var(--info-50)] text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Turno</span><span className="font-semibold">{numeroTurno(objetivo.numero, objetivo.prefijo)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Paciente</span><span className="font-medium">{objetivo.pacienteNombre}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">CI</span><span className="font-medium">{objetivo.pacienteCI || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Médico</span><span className="font-medium">{objetivo.medicoNombre}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Fecha</span><span className="font-medium">{fmtFecha(new Date())}</span></div>
            </div>
            <Input label="Concepto" value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Consulta General" />
            <Input label="Monto (Bs)" type="number" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} />
            <p className="text-xs text-[var(--text-tertiary)]">Forma de pago: <strong>Efectivo</strong>. Al confirmar, el turno queda habilitado para la atención médica y se emite el recibo.</p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setObjetivo(null)}>Cancelar</Button>
              <Button variant="success" loading={guardando} onClick={registrar}><Banknote className="w-4 h-4" />Confirmar pago {fmtBs(Number(monto) || 0)}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Pago sin turno */}
      <Modal isOpen={manualOpen} onClose={() => setManualOpen(false)} title="Registrar pago sin turno" size="md">
        <div className="space-y-4">
          <div className="relative">
            <Input label="Paciente" placeholder="Buscar por nombre o CI (mín. 2 letras)" value={pacSel ? `${pacSel.nombre} ${pacSel.apellido} — ${pacSel.ci}` : pacQuery}
              onChange={(e) => { setPacSel(null); setPacQuery(e.target.value); }} />
            {!pacSel && pacientesFiltrados.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-lg max-h-56 overflow-y-auto">
                {pacientesFiltrados.map((p) => (
                  <button key={p.id} type="button" onClick={() => setPacSel(p)} className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-secondary)]">
                    <span className="font-medium">{p.nombre} {p.apellido}</span> <span className="text-xs text-[var(--text-tertiary)]">CI {p.ci}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Input label="Concepto" placeholder="Ej. Certificado médico" value={mConcepto} onChange={(e) => setMConcepto(e.target.value)} />
          <Input label="Monto (Bs)" type="number" step="0.01" value={mMonto} onChange={(e) => setMMonto(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setManualOpen(false)}>Cancelar</Button>
            <Button variant="success" loading={guardando} onClick={registrarManual}><Banknote className="w-4 h-4" />Registrar pago</Button>
          </div>
        </div>
      </Modal>

      {/* Recibo emitido */}
      <Modal isOpen={!!reciboEmitido} onClose={() => setReciboEmitido(null)} title="Pago registrado" size="sm" accent="success">
        {reciboEmitido && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: 'var(--success-500)' }} />
            <div>
              <p className="text-lg font-bold text-[var(--text-primary)]">Recibo {reciboEmitido.numeroRecibo}</p>
              <p className="text-sm text-[var(--text-secondary)]">{reciboEmitido.pacienteNombre} · {reciboEmitido.concepto}</p>
              <p className="text-2xl font-bold mt-2 text-[var(--success-600)]">{fmtBs(reciboEmitido.monto)}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-[var(--success-50)] text-[var(--success-700)]">PAGADO</span>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setReciboEmitido(null)}>Cerrar</Button>
              <Button onClick={() => imprimir(reciboEmitido)}><Printer className="w-4 h-4" />Imprimir recibo</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
