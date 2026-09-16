import { useEffect, useState } from 'react';
import { Plus, Activity, Timer, AlertOctagon, Play, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card, EsiBadge, esiMeta } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { useStore } from '../store';
import { triageService, type Triage } from '../api/triage.service';
import TriajeFormModal from '../components/clinico/TriajeFormModal';
import { lista } from '../utils/api.utils';
import { errMsg } from '../api/errMsg';

const ESTADO_LABEL: Record<string, string> = {
  activo: 'Clasificado', en_espera: 'En espera', en_atencion: 'En atención', completado: 'Atendido', cancelado: 'Cancelado',
};

function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export default function TriajePage() {
  const { pacientes, fetchPacientes } = useStore();
  const [triages, setTriages] = useState<Triage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [soloActivos, setSoloActivos] = useState(true);
  const now = useNow();

  const load = async () => {
    try {
      const res = await triageService.getAll({ limit: 200 });
      setTriages(lista<Triage>(res));
    } catch (e) { toast('error', 'Error', errMsg(e, 'No se pudieron cargar los triajes')); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => { fetchPacientes(); void load(); }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pacienteNombre = (id: number) => {
    const p = pacientes.find((x) => x.id === id);
    return p ? `${p.nombre} ${p.apellido}` : `Paciente #${id}`;
  };

  const espera = (t: Triage) => {
    if (!t.fechaHora || t.estado === 'completado' || t.estado === 'cancelado') return null;
    const inicio = new Date(t.fechaHora).getTime();
    if (Number.isNaN(inicio)) return null;
    return Math.max(0, Math.floor((now - inicio) / 60000));
  };

  const cambiar = async (t: Triage, estado: string) => {
    try {
      await triageService.cambiarEstado(t.id, estado);
      toast('success', 'Estado actualizado', `${pacienteNombre(t.pacienteId)} → ${ESTADO_LABEL[estado] ?? estado}`);
      load();
    } catch (e) { toast('error', 'No se pudo cambiar el estado', errMsg(e)); }
  };

  const visibles = triages
    .filter((t) => (soloActivos ? t.estado !== 'completado' && t.estado !== 'cancelado' : true))
    .sort((a, b) => a.esiNivel - b.esiNivel || new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());

  const conteo = [1, 2, 3, 4, 5].map((n) => ({
    nivel: n,
    total: triages.filter((t) => t.esiNivel === n && t.estado !== 'completado' && t.estado !== 'cancelado').length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Activity}
        title="Triaje ESI"
        subtitle="Clasificación por severidad: la prioridad clínica manda sobre el orden de llegada"
        stats={[{ label: 'pendientes', value: conteo.reduce((s, c) => s + c.total, 0) }, { label: 'registrados', value: triages.length }]}
        action={<Button onClick={() => setModal(true)}><Plus className="w-4 h-4" />Nuevo Triaje</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {conteo.map(({ nivel, total }) => {
          const meta = esiMeta(nivel);
          return (
            <div key={nivel} className="rounded-xl p-4 border-l-4 shadow-sm" style={{ backgroundColor: meta.bg, borderLeftColor: meta.accent }}>
              <span className="text-sm font-extrabold" style={{ color: meta.text }}>{meta.label} · {meta.desc}</span>
              <p className="text-2xl font-bold mt-1" style={{ color: meta.text }}>{total}</p>
              <p className="text-[11px] mt-0.5" style={{ color: meta.text }}>
                {meta.maxWaitMin === 0 ? 'Atención inmediata' : `Espera máx. ${meta.maxWaitMin} min`}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setSoloActivos(true)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${soloActivos ? 'bg-[var(--primary-50)] text-[var(--primary-700)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>Pendientes</button>
        <button onClick={() => setSoloActivos(false)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${!soloActivos ? 'bg-[var(--primary-50)] text-[var(--primary-700)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>Todos</button>
      </div>

      {loading && triages.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-3">
                <div className="h-5 shimmer rounded w-2/3" />
                <div className="h-4 shimmer rounded w-1/2" />
                <div className="h-4 shimmer rounded w-full" />
                <div className="flex gap-2 pt-2">
                  <div className="h-8 shimmer rounded-lg w-24" />
                  <div className="h-8 shimmer rounded-lg w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : visibles.length === 0 ? (
        <Card><p className="text-sm text-center py-8" style={{ color: 'var(--text-tertiary)' }}>No hay triajes {soloActivos ? 'pendientes' : 'registrados'}</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibles.map((t) => {
            const meta = esiMeta(t.esiNivel);
            const min = espera(t);
            const vencido = min != null && meta.maxWaitMin > 0 && min > meta.maxWaitMin;
            return (
              <Card key={t.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pacienteNombre(t.pacienteId)}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {ESTADO_LABEL[t.estado] || t.estado} · {new Date(t.fechaHora).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <EsiBadge nivel={t.esiNivel} />
                </div>
                {t.motivoConsulta && <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{t.motivoConsulta}</p>}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {t.temperatura != null && <span>T° {t.temperatura}</span>}
                  {t.presionArterial && <span>PA {t.presionArterial}</span>}
                  {t.frecuenciaCardiaca != null && <span>FC {t.frecuenciaCardiaca}</span>}
                  {t.saturacionOxigeno != null && <span>SpO₂ {t.saturacionOxigeno}%</span>}
                  {t.peso != null && <span>Peso {t.peso} kg</span>}
                  {t.talla != null && <span>Talla {t.talla} cm</span>}
                </div>
                {t.enfermedadActual && <p className="text-xs mt-2 italic" style={{ color: 'var(--text-tertiary)' }}>{t.enfermedadActual}</p>}
                <div className="flex items-center justify-between gap-2 mt-3">
                  {min != null ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{
                        backgroundColor: vencido ? 'var(--alert-critical-bg)' : 'var(--bg-secondary)',
                        color: vencido ? 'var(--alert-critical-text)' : 'var(--text-secondary)',
                        border: `1px solid ${vencido ? 'var(--alert-critical-accent)' : 'transparent'}`,
                      }}>
                      {vencido ? <AlertOctagon className="w-3.5 h-3.5" /> : <Timer className="w-3.5 h-3.5" />}
                      {min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`}
                      {vencido && ' · superó el máximo'}
                    </div>
                  ) : <span />}
                  <div className="flex gap-1">
                    {(t.estado === 'activo' || t.estado === 'en_espera') && (
                      <Button size="sm" variant="secondary" onClick={() => cambiar(t, 'en_atencion')}><Play className="w-3.5 h-3.5" />Atender</Button>
                    )}
                    {t.estado === 'en_atencion' && (
                      <Button size="sm" variant="success" onClick={() => cambiar(t, 'completado')}><CheckCircle2 className="w-3.5 h-3.5" />Atendido</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <TriajeFormModal isOpen={modal} onClose={() => setModal(false)} onSaved={load} pacientes={pacientes} />
    </div>
  );
}
