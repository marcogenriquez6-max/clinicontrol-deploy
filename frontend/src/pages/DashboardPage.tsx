import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Ticket, Banknote, ReceiptText, UserPlus, Hourglass } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, KpiCard, Button, Badge } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { reportesService } from '../api/reportes.service';
import { pagoService } from '../api/pago.service';
import { turnoService } from '../api/turno.service';
import { lista, objeto } from '../utils/api.utils';
import { fmtBs } from '../utils/impresion';
import { numeroTurno, estadoTurnoLabel, estadoTurnoVariant, horaDe } from '../utils/turno.utils';
import type { Turno, TurnoPendientePago } from '../types';

interface Indicadores {
  pacientesDelDia: number;
  totalPacientes: number;
  consultasRealizadas: number;
  triajesRealizados: number;
  hospitalizados: number;
  citasHoy: number;
  turnosHoy: number;
  pagosHoy: { cantidad: number; total: number };
  camas: { total: number; ocupadas: number; disponibles: number; porcentajeOcupacion: number };
}

/** Dashboard de Recepción: el día en un vistazo y accesos directos al flujo del paciente. */
export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [ind, setInd] = useState<Indicadores | null>(null);
  const [pendientes, setPendientes] = useState<TurnoPendientePago[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vivo = true;
    const load = async () => {
      try {
        const [i, p, t] = await Promise.all([
          reportesService.indicadores().catch(() => null),
          pagoService.getPendientes().catch(() => null),
          turnoService.getHoy().catch(() => null),
        ]);
        if (!vivo) return;
        if (i) setInd(objeto<Indicadores>(i));
        setPendientes(p ? lista<TurnoPendientePago>(p) : []);
        setTurnos(t ? lista<Turno>(t) : []);
      } finally { if (vivo) setLoading(false); }
    };
    const id = setTimeout(load, 0);
    const iv = setInterval(load, 30000);
    return () => { vivo = false; clearTimeout(id); clearInterval(iv); };
  }, []);

  const esperando = turnos.filter((t) => t.estado === 'espera' || t.estado === 'llamado');
  const sinDatos = !loading && !ind;
  const hoy = new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title={`Bienvenido, ${user?.nombre ?? ''}`}
        subtitle={`Recepción · ${hoy}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Pacientes registrados hoy" value={sinDatos ? '—' : (ind?.pacientesDelDia ?? 0)} color="blue" badge={sinDatos ? undefined : `${ind?.totalPacientes ?? 0} en padrón`} loading={loading} />
        <KpiCard icon={Calendar} label="Citas de hoy" value={sinDatos ? '—' : (ind?.citasHoy ?? 0)} color="violet" loading={loading} />
        <KpiCard icon={Ticket} label="Turnos emitidos hoy" value={sinDatos ? '—' : (ind?.turnosHoy ?? 0)} color="amber" badge={sinDatos ? undefined : `${esperando.length} esperando`} loading={loading} />
        <KpiCard icon={Banknote} label="Pagos registrados hoy" value={sinDatos ? '—' : fmtBs(ind?.pagosHoy?.total ?? 0)} color="emerald" badge={sinDatos ? undefined : `${ind?.pagosHoy?.cantidad ?? 0} recibo(s)`} loading={loading} />
      </div>

      <Card title="Flujo del paciente" subtitle="Registrar o recuperar expediente → cita → turno → pago → recibo">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: UserPlus, label: 'Registrar paciente', to: '/pacientes' },
            { icon: Calendar, label: 'Programar cita', to: '/citas' },
            { icon: Ticket, label: 'Generar turno', to: '/turnos' },
            { icon: Banknote, label: 'Registrar pago', to: '/pagos' },
            { icon: ReceiptText, label: 'Imprimir recibo', to: '/recibos' },
          ].map((a) => (
            <button key={a.to} onClick={() => navigate(a.to)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--primary-300)] hover:bg-[var(--primary-50)] transition-colors">
              <a.icon className="w-6 h-6 text-[var(--primary-600)]" />
              <span className="text-sm font-medium text-[var(--text-primary)] text-center">{a.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Pagos pendientes" subtitle={`${pendientes.length} turno(s) de hoy sin pago registrado`}
          action={<Button size="sm" variant="secondary" onClick={() => navigate('/pagos')}>Ir a Pagos</Button>}>
          {pendientes.length === 0 ? (
            <p className="text-sm text-center py-8 text-[var(--text-tertiary)]">Todos los turnos de hoy tienen su pago registrado</p>
          ) : (
            <div className="divide-y divide-[var(--border-secondary)]">
              {pendientes.slice(0, 6).map((p) => (
                <div key={p.turnoId} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-14 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white tabular-nums" style={{ backgroundColor: 'var(--warning-500)' }}>{numeroTurno(p.numero, p.prefijo)}</span>
                    <div className="min-w-0"><p className="text-sm font-medium truncate text-[var(--text-primary)]">{p.pacienteNombre}</p><p className="text-xs text-[var(--text-tertiary)] truncate">{p.concepto}</p></div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold tabular-nums">{fmtBs(p.monto)}</span>
                    <Button size="sm" variant="success" onClick={() => navigate('/pagos')} title="Cobrar este turno">
                      <Banknote className="w-3.5 h-3.5" />Cobrar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Sala de espera" subtitle={`${esperando.length} paciente(s) esperando atención`}
          action={<Button size="sm" variant="secondary" onClick={() => navigate('/turnos')}>Ver turnos</Button>}>
          {esperando.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-tertiary)]"><Hourglass className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No hay pacientes en espera</p></div>
          ) : (
            <div className="divide-y divide-[var(--border-secondary)]">
              {esperando.slice(0, 6).map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-14 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white tabular-nums" style={{ backgroundColor: 'var(--primary-600)' }}>{numeroTurno(t.numero, t.prefijo)}</span>
                    <div className="min-w-0"><p className="text-sm font-medium truncate text-[var(--text-primary)]">{t.pacienteNombre}</p><p className="text-xs text-[var(--text-tertiary)] truncate">{t.medicoNombre} · {t.horaProgramada || horaDe(t.creadoEn)}</p></div>
                  </div>
                  <Badge variant={estadoTurnoVariant(t.estado)}>{estadoTurnoLabel(t.estado)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
