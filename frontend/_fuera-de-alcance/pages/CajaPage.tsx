import { useEffect, useState } from 'react';
import {
  LayoutDashboard, DollarSign, Plus, X, LockKeyhole, RefreshCw,
  Wallet, Hourglass, ReceiptText, CheckCircle2, Search, ClipboardList, AlertTriangle,
} from 'lucide-react';
import { Button, Card, Input, Modal } from '../components/ui';
import KpiCard from '../components/ui/KpiCard';
import { toast } from '../components/ui/Toast';
import PageHeader from '../components/ui/PageHeader';
import { errMsg } from '../api/errMsg';
import { cajaService } from '../api/caja.service';
import { turnoService } from '../api/turno.service';
import { useAuthStore } from '../store/authStore';
import type { CajaSession } from '../types';
import type { Turno } from '../types/turno.types';

const bs = (n: number): string => `Bs. ${Number(n || 0).toFixed(2)}`;

export default function CajaPage() {
  const user = useAuthStore((s) => s.user);
  const [session, setSession] = useState<CajaSession | null>(null);
  const [ultimaCerrada, setUltimaCerrada] = useState<CajaSession | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [montoInicial, setMontoInicial] = useState('');
  const [montoFinal, setMontoFinal] = useState('');
  const [obsCierre, setObsCierre] = useState('');
  const [showCerrar, setShowCerrar] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [cobrandoId, setCobrandoId] = useState<number | null>(null);

  const mensajeCarga = (e: unknown): string => {
    const err = e as { response?: { status?: number }; request?: unknown };
    const status = err?.response?.status;
    if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    if (status === 429) return 'El servidor está saturado de solicitudes. Espera unos segundos y reintenta.';
    if (!err?.response) return 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
    return errMsg(e, 'Error inesperado del servidor.');
  };

  const aplicarDatos = (sessionRes: unknown, turnosRes: unknown, sesionesRes?: unknown) => {
    const sessionData = (sessionRes as { data?: CajaSession })?.data ?? sessionRes;
    const turnosData = (turnosRes as { data?: Turno[] })?.data ?? turnosRes;
    setSession((sessionData as CajaSession | null) ?? null);
    setTurnos(Array.isArray(turnosData) ? turnosData : []);
    if (sesionesRes !== undefined && !(sessionData as CajaSession | null)) {
      const lista = ((sesionesRes as { data?: CajaSession[] })?.data ?? sesionesRes) as CajaSession[];
      const cerrada = Array.isArray(lista) ? lista.find((s) => s.estado === 'cerrada') ?? null : null;
      setUltimaCerrada(cerrada);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [sessionRes, turnosRes] = await Promise.all([
        cajaService.getActual(),
        turnoService.getAll({ limit: 200 }),
      ]);
      let sesionesRes: unknown;
      try {
        const sessionData = (sessionRes as { data?: CajaSession })?.data ?? sessionRes;
        if (!sessionData) sesionesRes = await cajaService.getAll();
      } catch { /* el historial es opcional */ }
      aplicarDatos(sessionRes, turnosRes, sesionesRes);
    } catch (e: unknown) {
      setLoadError(mensajeCarga(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => { void fetchData(); }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirSesion = async () => {
    if (!montoInicial || Number(montoInicial) <= 0) {
      toast('warning', 'Ingrese un monto inicial válido');
      return;
    }
    if (!user?.id) {
      toast('error', 'Debe iniciar sesión');
      return;
    }
    setLoading(true);
    try {
      const res = await cajaService.abrirSesion(Number(montoInicial), user.id);
      const nueva = res.data ?? res;
      setSession(nueva as CajaSession);
      setMontoInicial('');
      setUltimaCerrada(null);
      toast('success', 'Sesión de caja abierta', `Monto inicial: ${bs(Number(montoInicial))}`);
    } catch (e: unknown) {
      toast('error', 'Error al abrir sesión', errMsg(e, 'Intente nuevamente'));
    } finally {
      setLoading(false);
    }
  };

  const cobrarTurno = async (t: Turno) => {
    setCobrandoId(t.id!);
    try {
      await turnoService.marcarPagado(t.id!);
      setTurnos(prev => prev.map((x) => x.id === t.id ? { ...x, pagado: true } : x));
      toast('success', `Turno #${String(t.numero).padStart(3, '0')} cobrado`, `${t.pacienteNombre} · ${bs(Number(t.monto))}`);
    } catch (e: unknown) {
      toast('error', 'Error al registrar cobro', errMsg(e));
    } finally {
      setCobrandoId(null);
    }
  };

  const cerrarSesion = async () => {
    if (!session || !montoFinal || Number(montoFinal) < 0) {
      toast('warning', 'Ingrese un monto final válido');
      return;
    }
    setLoading(true);
    try {
      const res = await cajaService.cerrarSesion(session.id, Number(montoFinal), obsCierre || undefined);
      const cerrada = (res.data ?? res) as CajaSession;
      setSession(cerrada);
      setUltimaCerrada(cerrada);
      setShowCerrar(false);
      setMontoFinal('');
      setObsCierre('');
      toast('success', 'Sesión de caja cerrada', `Monto final: ${bs(Number(montoFinal))}`);
    } catch (e: unknown) {
      toast('error', 'Error al cerrar sesión', errMsg(e, 'Intente nuevamente'));
    } finally {
      setLoading(false);
    }
  };

  const turnosPagadosHoy = turnos.filter((t) => t.pagado);
  const turnosPendientes = turnos.filter((t) => !t.pagado && t.estado !== 'cancelado');
  const totalPagado = turnosPagadosHoy.reduce((sum, t) => sum + Number(t.monto), 0);
  const totalPendiente = turnosPendientes.reduce((sum, t) => sum + Number(t.monto), 0);
  const cajaAbierta = !!session && session.estado === 'abierta';
  const esperadoEnCaja = Number(session?.montoInicial ?? 0) + totalPagado;

  const cobrosFiltrados = (() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return turnosPagadosHoy;
    return turnosPagadosHoy.filter((t) =>
      t.pacienteNombre.toLowerCase().includes(q) ||
      t.pacienteCI.toLowerCase().includes(q) ||
      String(t.numero).padStart(3, '0').includes(q),
    );
  })();

  const difCierre = montoFinal === '' ? null : Number(montoFinal) - esperadoEnCaja;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Caja"
        subtitle="Cobros de turnos, control de efectivo y arqueo de cierre"
        stats={[
          { label: 'Estado', value: cajaAbierta ? 'Abierta' : 'Cerrada' },
          { label: 'Cobros hoy', value: turnosPagadosHoy.length },
          { label: 'Total Bs.', value: totalPagado.toFixed(2) },
        ]}
      />

      {loadError && (
        <div className="max-w-4xl mx-auto rounded-lg px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3 border"
          style={{ backgroundColor: 'var(--danger-50)', borderColor: 'var(--danger-200)' }}>
          <p className="flex-1 text-sm" style={{ color: 'var(--danger-700)' }}>
            {loadError}
          </p>
          <Button size="sm" variant="secondary" onClick={fetchData} loading={loading}>
            <RefreshCw className="w-4 h-4" />Reintentar conexión
          </Button>
        </div>
      )}

      {/* CAJA CERRADA — apertura + resumen del último arqueo */}
      {!cajaAbierta && !loadError && (
        <div className="max-w-md mx-auto pt-8 space-y-5">
          {ultimaCerrada && (
            <Card className="text-left">
              <div className="p-1 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" style={{ color: 'var(--primary-600)' }} />
                    Último cierre
                  </p>
                  {(() => {
                    const esperado = Number(ultimaCerrada.montoInicial ?? 0) + totalPagado;
                    const dif = ultimaCerrada.montoFinal != null ? Number(ultimaCerrada.montoFinal) - esperado : null;
                    const ok = dif !== null && Math.abs(dif) < 0.01;
                    return (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={ok
                          ? { backgroundColor: 'var(--success-50)', color: 'var(--success-700)' }
                          : { backgroundColor: 'var(--warning-50)', color: 'var(--warning-700)' }}>
                        {dif === null ? '—' : ok ? 'Cuadrada ✓' : `Dif. ${bs(dif)}`}
                      </span>
                    );
                  })()}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <div><p className="text-xs text-[var(--text-tertiary)]">Apertura</p><p className="font-medium text-[var(--text-primary)]">{new Date(ultimaCerrada.fechaApertura).toLocaleDateString('es-BO')}</p></div>
                  <div><p className="text-xs text-[var(--text-tertiary)]">Cierre</p><p className="font-medium text-[var(--text-primary)]">{ultimaCerrada.fechaCierre ? new Date(ultimaCerrada.fechaCierre).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</p></div>
                  <div><p className="text-xs text-[var(--text-tertiary)]">Fondo inicial</p><p className="font-medium tabular-nums text-[var(--text-primary)]">{bs(Number(ultimaCerrada.montoInicial))}</p></div>
                  <div><p className="text-xs text-[var(--text-tertiary)]">Monto final</p><p className="font-medium tabular-nums text-[var(--text-primary)]">{bs(Number(ultimaCerrada.montoFinal ?? 0))}</p></div>
                </div>
                {ultimaCerrada.observaciones && (
                  <p className="text-xs italic text-[var(--text-secondary)] border-t border-dashed border-[var(--border-primary)] pt-2">"{ultimaCerrada.observaciones}"</p>
                )}
              </div>
            </Card>
          )}

          <Card className="text-center" padding>
            <div className="py-6 px-2 space-y-5">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <LockKeyhole className="w-7 h-7" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <div className="space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
                  Caja cerrada
                </span>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">No hay una sesión activa</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Para comenzar las operaciones del día, ingrese el fondo inicial con el que abre caja.
                </p>
              </div>
              <div className="max-w-[240px] mx-auto text-left">
                <Input
                  label="Fondo inicial (Bs.)"
                  type="number"
                  placeholder="0.00"
                  value={montoInicial}
                  onChange={(e) => setMontoInicial(e.target.value)}
                  prefix={<DollarSign className="w-4 h-4" />}
                />
              </div>
              <Button size="lg" loading={loading} onClick={abrirSesion} className="w-full max-w-[240px] mx-auto">
                <Plus className="w-4 h-4" />Abrir Sesión
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* CAJA ABIERTA */}
      {cajaAbierta && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <KpiCard icon={Wallet} label="Esperado en caja" value={bs(esperadoEnCaja)} color="blue"
              badge={`Fondo ${bs(Number(session!.montoInicial))}`} />
            <KpiCard icon={CheckCircle2} label="Cobrado hoy" value={bs(totalPagado)} color="emerald" />
            <KpiCard icon={Hourglass} label="Pendiente por cobrar" value={bs(totalPendiente)}
              color={totalPendiente > 0 ? 'amber' : 'cyan'} badge={`${turnosPendientes.length} turno(s)`} />
            <KpiCard icon={ReceiptText} label="Tickets cobrados" value={turnosPagadosHoy.length} color="violet" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Sesión Actual" subtitle={`Abierta ${new Date(session!.fechaApertura).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`} accent="success">
                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-lg bg-[var(--success-50)] border border-[var(--success-200)]">
                    <span className="text-sm text-[var(--text-tertiary)]">Monto Inicial</span>
                    <span className="font-bold tabular-nums text-[var(--success-600)]">{bs(Number(session!.montoInicial))}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                    <span className="text-sm text-[var(--text-tertiary)]">Total Cobrado</span>
                    <span className="font-bold tabular-nums text-[var(--primary-600)]">{bs(totalPagado)}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-[var(--primary-50)] border border-[var(--primary-200)]">
                    <span className="text-sm text-[var(--text-tertiary)]">Total Esperado</span>
                    <span className="font-bold tabular-nums text-[var(--primary-800)]">{bs(esperadoEnCaja)}</span>
                  </div>
                  <Button className="w-full" variant="danger" onClick={() => setShowCerrar(true)}>
                    <X className="w-4 h-4" />Cerrar Sesión y Arquear
                  </Button>
                </div>
              </Card>

              <Card title="Pendientes de Cobro" subtitle={`${turnosPendientes.length} turno(s) sin pagar`}>
                {turnosPendientes.length === 0 ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--success-500)' }} />
                    <p className="text-sm text-[var(--text-tertiary)]">Todo cobrado. Al día ✓</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {turnosPendientes.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-md flex items-center justify-center text-sm font-bold text-white tabular-nums shrink-0" style={{ backgroundColor: 'var(--warning-500)' }}>
                            {String(t.numero).padStart(3, '0')}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-[var(--text-primary)] truncate">{t.pacienteNombre}</p>
                            <p className="text-xs text-[var(--text-tertiary)] truncate">{t.tipo ?? 'Servicio'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-sm tabular-nums text-[var(--text-primary)]">{bs(Number(t.monto))}</span>
                          <Button size="sm" loading={cobrandoId === t.id} onClick={() => cobrarTurno(t)}>
                            Cobrar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card title="Cobros del Día"
                subtitle={`${turnosPagadosHoy.length} turno(s) pagado(s) · Total ${bs(totalPagado)}`}>
                {turnosPagadosHoy.length === 0 ? (
                  <div className="text-center py-10 text-[var(--text-tertiary)]">No hay cobros registrados hoy</div>
                ) : (
                  <>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      <input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por paciente, CI o número..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-100)] dark:focus:ring-blue-900/40 transition-colors"
                      />
                    </div>
                    <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                      <table className="table-premium w-full">
                        <thead className="sticky top-0">
                          <tr><th>#</th><th>Paciente</th><th>Servicio</th><th>Monto</th><th>Hora</th></tr>
                        </thead>
                        <tbody>
                          {cobrosFiltrados.map((t) => (
                            <tr key={t.id}>
                              <td className="font-bold tabular-nums">{String(t.numero).padStart(3, '0')}</td>
                              <td>
                                <p className="font-medium">{t.pacienteNombre}</p>
                                <p className="text-xs text-[var(--text-tertiary)]">{t.pacienteCI}</p>
                              </td>
                              <td className="text-sm">{t.tipo ?? '—'}</td>
                              <td className="tabular-nums font-medium">{bs(Number(t.monto))}</td>
                              <td className="text-sm text-[var(--text-tertiary)] tabular-nums">
                                {t.creadoEn ? new Date(t.creadoEn).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </td>
                            </tr>
                          ))}
                          {cobrosFiltrados.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-6 text-sm text-[var(--text-tertiary)]">Sin resultados para "{busqueda}"</td></tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="font-bold">
                            <td colSpan={3} className="text-right text-[var(--text-primary)]">Total{busqueda ? ` (${cobrosFiltrados.length})` : ''}</td>
                            <td className="tabular-nums">{bs(cobrosFiltrados.reduce((s, t) => s + Number(t.monto), 0))}</td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={showCerrar} onClose={() => setShowCerrar(false)} title="Cerrar Sesión de Caja" size="sm" accent="danger">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[var(--info-50)] border border-[var(--info-200)] text-sm flex items-center justify-between">
            <span className="text-[var(--info-700)]">Debería haber en caja:</span>
            <span className="font-bold tabular-nums text-[var(--info-800)]">{bs(esperadoEnCaja)}</span>
          </div>
          <Input
            label="Monto Final contado (Bs.) *"
            type="number"
            placeholder="0.00"
            value={montoFinal}
            onChange={(e) => setMontoFinal(e.target.value)}
            prefix={<DollarSign className="w-4 h-4" />}
          />
          {difCierre !== null && (
            <div className="p-3 rounded-lg text-sm flex items-center gap-2 border"
              style={Math.abs(difCierre) < 0.01
                ? { backgroundColor: 'var(--success-50)', borderColor: 'var(--success-200)', color: 'var(--success-700)' }
                : { backgroundColor: 'var(--warning-50)', borderColor: 'var(--warning-200)', color: 'var(--warning-700)' }}>
              {Math.abs(difCierre) < 0.01
                ? <><CheckCircle2 className="w-4 h-4 shrink-0" />Caja cuadrada exactamente ✓</>
                : <><AlertTriangle className="w-4 h-4 shrink-0" />Diferencia de arqueo: {bs(difCierre)} ({difCierre > 0 ? 'sobra' : 'falta'})</>}
            </div>
          )}
          <Input
            label="Observaciones"
            placeholder="Notas opcionales (ej. faltante reportado)..."
            value={obsCierre}
            onChange={(e) => setObsCierre(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setShowCerrar(false); setMontoFinal(''); }}>Cancelar</Button>
            <Button variant="danger" loading={loading} onClick={cerrarSesion}>
              <X className="w-4 h-4" />Cerrar Sesión
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
