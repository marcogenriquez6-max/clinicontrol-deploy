import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Play, FileText, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card, Badge } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { errMsg } from '../api/errMsg';
import { turnoService } from '../api/turno.service';
import { useAuthStore } from '../store/authStore';
import type { Turno } from '../types';
import { lista } from '../utils/api.utils';
import { numeroTurno, estadoTurnoLabel, estadoTurnoVariant, horaDe } from '../utils/turno.utils';

/**
 * Médico → Agenda del Día. Al iniciar sesión el médico ve únicamente sus
 * pacientes programados de hoy con pago registrado (o urgencia ESI-1/2).
 */
export default function AgendaDiaPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);
  const [verTodos, setVerTodos] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setTurnos(lista<Turno>(await turnoService.getHoy())); }
    catch (e) { toast('error', 'No se pudo cargar la agenda', errMsg(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(load, 0);
    const iv = setInterval(load, 20000);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, []);

  const habilitados = turnos.filter((t) => (t.pagado || t.esUrgencia) && t.estado !== 'cancelado' && t.estado !== 'no_asistio');
  const sinPago = turnos.filter((t) => !t.pagado && !t.esUrgencia && (t.estado === 'espera' || t.estado === 'llamado'));
  const programados = habilitados.filter((t) => t.estado === 'espera' || t.estado === 'llamado').sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
  const enAtencion = habilitados.filter((t) => t.estado === 'atencion');
  const finalizados = habilitados.filter((t) => t.estado === 'completado');

  const irAConsulta = (t: Turno) => navigate('/consulta-completa', {
    state: { pacienteId: t.pacienteId, medicoId: t.medicoId, turnoId: t.id, turnoNumero: numeroTurno(t.numero, t.prefijo), pacienteNombre: t.pacienteNombre },
  });

  const atender = async (t: Turno) => {
    try {
      await turnoService.updateEstado(t.id, 'atencion');
      toast('success', `Atendiendo turno ${numeroTurno(t.numero, t.prefijo)}`, t.pacienteNombre);
      irAConsulta(t);
    } catch (e) { toast('error', 'No se puede iniciar la atención', errMsg(e)); }
  };

  const finalizar = async (t: Turno) => {
    try {
      await turnoService.updateEstado(t.id, 'completado');
      toast('success', `Turno ${numeroTurno(t.numero, t.prefijo)} finalizado`);
      load();
    } catch (e) { toast('error', 'No se pudo finalizar', errMsg(e)); }
  };

  const Fila = ({ t, acciones }: { t: Turno; acciones: React.ReactNode }) => (
    <tr>
      <td><span className="inline-flex items-center justify-center w-16 h-9 rounded-md font-bold text-white tabular-nums" style={{ backgroundColor: t.estado === 'atencion' ? 'var(--success-600)' : t.estado === 'completado' ? 'var(--neutral-400)' : 'var(--primary-600)' }}>{numeroTurno(t.numero, t.prefijo)}</span></td>
      <td>
        <p className="font-medium text-[var(--text-primary)]">{t.pacienteNombre}</p>
        <p className="text-xs text-[var(--text-tertiary)]">CI {t.pacienteCI || '—'}{t.tipo ? ` · ${t.tipo}` : ''}</p>
      </td>
      <td className="tabular-nums">{t.horaProgramada || horaDe(t.creadoEn)}</td>
      <td>
        <div className="flex flex-wrap gap-1">
          <Badge variant={estadoTurnoVariant(t.estado)}>{estadoTurnoLabel(t.estado)}</Badge>
          {t.pagado ? <Badge variant="success">Pagado</Badge> : t.esUrgencia ? <Badge variant="danger">Urgencia ESI</Badge> : null}
        </div>
      </td>
      <td className="text-right"><div className="inline-flex gap-1">{acciones}</div></td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarCheck}
        title="Agenda del Día"
        subtitle={`Dr(a). ${user?.nombre ?? ''} · ${new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })} · solo pacientes con pago registrado`}
        stats={[{ label: 'programados', value: programados.length }, { label: 'en atención', value: enAtencion.length }, { label: 'finalizados', value: finalizados.length }]}
        action={<Button variant="secondary" onClick={load} loading={loading}><RefreshCw className="w-4 h-4" />Actualizar</Button>}
      />

      <Card title="Pacientes programados" subtitle="En orden de turno. Al atender se abre la historia clínica y el registro SOAP." className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium w-full text-sm">
            <thead><tr><th>Turno</th><th>Paciente</th><th>Hora</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
            <tbody>
              {programados.length === 0 && enAtencion.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-[var(--text-tertiary)]">No tiene pacientes programados con pago registrado en este momento</td></tr>
              )}
              {enAtencion.map((t) => (
                <Fila key={t.id} t={t} acciones={<>
                  <Button size="sm" onClick={() => irAConsulta(t)}><FileText className="w-4 h-4" />Continuar consulta</Button>
                  <Button size="sm" variant="success" onClick={() => finalizar(t)}><CheckCircle2 className="w-4 h-4" />Finalizar</Button>
                </>} />
              ))}
              {programados.map((t) => (
                <Fila key={t.id} t={t} acciones={<>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/historia-clinica?paciente=${t.pacienteId}`)}><FileText className="w-4 h-4" />Historia</Button>
                  <Button size="sm" onClick={() => atender(t)}><Play className="w-4 h-4" />Atender</Button>
                </>} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Finalizados hoy" subtitle={`${finalizados.length} atención(es) concluida(s)`}>
          {finalizados.length === 0 ? <p className="text-sm text-center py-6 text-[var(--text-tertiary)]">Aún no hay atenciones finalizadas</p> : (
            <div className="divide-y divide-[var(--border-secondary)]">
              {finalizados.map((t) => (
                <div key={t.id} className="py-2 flex items-center justify-between gap-3">
                  <span className="text-sm"><strong className="tabular-nums">{numeroTurno(t.numero, t.prefijo)}</strong> · {t.pacienteNombre}</span>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/historia-clinica?paciente=${t.pacienteId}`)}><FileText className="w-4 h-4" />Historia</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Pendientes de pago" subtitle="Turnos asignados que todavía no pasaron por recepción"
          action={sinPago.length > 0 && <Button size="sm" variant="ghost" onClick={() => setVerTodos((v) => !v)}>{verTodos ? 'Ocultar' : 'Ver'}</Button>}>
          {sinPago.length === 0 ? <p className="text-sm text-center py-6 text-[var(--text-tertiary)]">Sin pendientes</p> : !verTodos ? (
            <div className="flex items-center gap-2 text-sm text-[var(--warning-700)]"><AlertTriangle className="w-4 h-4" />{sinPago.length} paciente(s) esperan registrar su pago en recepción.</div>
          ) : (
            <div className="divide-y divide-[var(--border-secondary)]">
              {sinPago.map((t) => (
                <div key={t.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                  <span><strong className="tabular-nums">{numeroTurno(t.numero, t.prefijo)}</strong> · {t.pacienteNombre}</span>
                  <Badge variant="warning">Sin pago</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
