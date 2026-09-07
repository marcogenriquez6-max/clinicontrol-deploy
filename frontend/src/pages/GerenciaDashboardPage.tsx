import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Stethoscope, Activity, BedDouble, Banknote, Calendar, TrendingUp, BarChart3, ClipboardList } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, KpiCard } from '../components/ui';
import { reportesService } from '../api/reportes.service';
import { objeto } from '../utils/api.utils';
import { fmtBs } from '../utils/impresion';

export interface Indicadores {
  fecha: string;
  pacientesDelDia: number; totalPacientes: number; consultasRealizadas: number; triajesRealizados: number; hospitalizados: number;
  citasHoy: number; turnosHoy: number; pagosHoy: { cantidad: number; total: number };
  camas: { total: number; ocupadas: number; disponibles: number; porcentajeOcupacion: number };
}

export function useIndicadores(intervalMs = 30000) {
  const [ind, setInd] = useState<Indicadores | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    try { setInd(objeto<Indicadores>(await reportesService.indicadores())); setError(null); }
    catch { setError('No se pudieron cargar los indicadores'); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    const t = setTimeout(load, 0);
    const iv = setInterval(load, intervalMs);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [intervalMs]);
  return { ind, loading, error, reload: load };
}

/** Gerencia → Dashboard: el día de la clínica en cinco números. */
export default function GerenciaDashboardPage() {
  const navigate = useNavigate();
  const { ind, loading } = useIndicadores();
  const hoy = new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="space-y-6">
      <PageHeader icon={LayoutDashboard} title="Gerencia" subtitle={`Supervisión de la operación · ${hoy}`} />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={Users} label="Pacientes del día" value={ind?.pacientesDelDia ?? 0} color="blue" badge={`${ind?.totalPacientes ?? 0} activos`} loading={loading} />
        <KpiCard icon={Stethoscope} label="Consultas realizadas" value={ind?.consultasRealizadas ?? 0} color="emerald" loading={loading} />
        <KpiCard icon={Activity} label="Triajes realizados" value={ind?.triajesRealizados ?? 0} color="rose" loading={loading} />
        <KpiCard icon={BedDouble} label="Hospitalizados" value={ind?.hospitalizados ?? 0} color="violet" loading={loading} />
        <KpiCard icon={BedDouble} label="Ocupación de camas" value={`${ind?.camas.porcentajeOcupacion ?? 0}%`} color="amber" badge={`${ind?.camas.ocupadas ?? 0}/${ind?.camas.total ?? 0}`} max={100} loading={loading} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard icon={Calendar} label="Citas de hoy" value={ind?.citasHoy ?? 0} color="cyan" loading={loading} />
        <KpiCard icon={ClipboardList} label="Turnos emitidos hoy" value={ind?.turnosHoy ?? 0} color="blue" loading={loading} />
        <KpiCard icon={Banknote} label="Pagos registrados hoy" value={fmtBs(ind?.pagosHoy.total ?? 0)} color="emerald" badge={`${ind?.pagosHoy.cantidad ?? 0} recibos`} loading={loading} />
      </div>
      <Card title="Accesos" subtitle="Indicadores, estadísticas del período y reportes imprimibles">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[{ icon: TrendingUp, label: 'Indicadores', desc: 'Detalle del día', to: '/gerencia/indicadores' }, { icon: BarChart3, label: 'Estadísticas', desc: 'Series por período', to: '/gerencia/estadisticas' }, { icon: ClipboardList, label: 'Reportes', desc: 'Pacientes, citas, médicos, hospitalización', to: '/gerencia/reportes' }].map((a) => (
            <button key={a.to} onClick={() => navigate(a.to)} className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--primary-300)] text-left transition-colors">
              <a.icon className="w-5 h-5 mt-0.5 text-[var(--primary-600)]" /><div><p className="font-medium text-[var(--text-primary)]">{a.label}</p><p className="text-xs text-[var(--text-tertiary)]">{a.desc}</p></div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
