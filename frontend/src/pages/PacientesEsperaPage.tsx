import { useEffect, useState } from 'react';
import { Hourglass, HeartPulse, RefreshCw } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card, Badge, EsiBadge } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { useStore } from '../store';
import { turnoService } from '../api/turno.service';
import { triageService, type Triage } from '../api/triage.service';
import TriajeFormModal from '../components/clinico/TriajeFormModal';
import type { Turno } from '../types';
import { lista, esHoy } from '../utils/api.utils';
import { numeroTurno, estadoTurnoLabel, estadoTurnoVariant, horaDe } from '../utils/turno.utils';
import { errMsg } from '../api/errMsg';

/**
 * Enfermería → Pacientes en Espera: turnos del día que aún no pasaron al médico.
 * Desde aquí se registra el triaje (signos vitales + ESI) de cada paciente.
 */
export default function PacientesEsperaPage() {
  const { pacientes, fetchPacientes } = useStore();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [triajesHoy, setTriajesHoy] = useState<Triage[]>([]);
  const [loading, setLoading] = useState(false);
  const [objetivo, setObjetivo] = useState<Turno | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [t, tr] = await Promise.all([turnoService.getHoy(), triageService.getAll({ limit: 300 })]);
      setTurnos(lista<Turno>(t));
      setTriajesHoy(lista<Triage>(tr).filter((x) => esHoy(x.fechaHora)));
    } catch (e) { toast('error', 'No se pudo cargar la sala de espera', errMsg(e)); } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => { fetchPacientes(); void load(); }, 0);
    const iv = setInterval(load, 20000);
    return () => { clearTimeout(t); clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enEspera = turnos
    .filter((t) => t.estado === 'espera' || t.estado === 'llamado')
    .sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
  const enAtencion = turnos.filter((t) => t.estado === 'atencion');
  const triajeDe = (pacienteId: number) => triajesHoy.find((x) => x.pacienteId === pacienteId);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Hourglass}
        title="Pacientes en Espera"
        subtitle="Turnos del día pendientes de atención médica. Registre el triaje antes de que pasen al consultorio."
        stats={[{ label: 'esperando', value: enEspera.length }, { label: 'en atención', value: enAtencion.length }, { label: 'con triaje hoy', value: enEspera.filter((t) => triajeDe(t.pacienteId)).length }]}
        action={<Button variant="secondary" onClick={load} loading={loading}><RefreshCw className="w-4 h-4" />Actualizar</Button>}
      />

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium w-full text-sm">
            <thead>
              <tr><th>Turno</th><th>Paciente</th><th>Hora</th><th>Médico</th><th>Estado</th><th>Triaje</th><th className="text-right">Acción</th></tr>
            </thead>
            <tbody>
              {enEspera.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-[var(--text-tertiary)]">No hay pacientes esperando en este momento</td></tr>
              )}
              {enEspera.map((t) => {
                const tr = triajeDe(t.pacienteId);
                return (
                  <tr key={t.id}>
                    <td><span className="inline-flex items-center justify-center w-16 h-9 rounded-md font-bold text-white tabular-nums" style={{ backgroundColor: 'var(--primary-600)' }}>{numeroTurno(t.numero, t.prefijo)}</span></td>
                    <td>
                      <p className="font-medium text-[var(--text-primary)]">{t.pacienteNombre}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">CI {t.pacienteCI || '—'}</p>
                    </td>
                    <td className="tabular-nums">{t.horaProgramada || horaDe(t.creadoEn)}</td>
                    <td className="text-[var(--text-secondary)]">{t.medicoNombre || '—'}{t.especialidad ? ` · ${t.especialidad}` : ''}</td>
                    <td><Badge variant={estadoTurnoVariant(t.estado)}>{estadoTurnoLabel(t.estado)}</Badge></td>
                    <td>{tr ? <div className="flex items-center gap-2"><EsiBadge nivel={tr.esiNivel} /><span className="text-xs text-[var(--text-tertiary)]">{horaDe(tr.fechaHora)}</span></div> : <span className="text-xs text-[var(--warning-700)] bg-[var(--warning-50)] px-2 py-0.5 rounded-full">Sin triaje</span>}</td>
                    <td className="text-right">
                      <Button size="sm" variant={tr ? 'secondary' : 'primary'} onClick={() => setObjetivo(t)}>
                        <HeartPulse className="w-4 h-4" />{tr ? 'Nuevo registro' : 'Registrar triaje'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {enAtencion.length > 0 && (
        <Card title="En atención ahora" subtitle={`${enAtencion.length} paciente(s) con el médico`}>
          <div className="flex flex-wrap gap-2">
            {enAtencion.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-sm">
                <strong className="tabular-nums">{numeroTurno(t.numero, t.prefijo)}</strong> {t.pacienteNombre} <span className="text-xs text-[var(--text-tertiary)]">· {t.medicoNombre}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      <TriajeFormModal
        isOpen={!!objetivo}
        onClose={() => setObjetivo(null)}
        onSaved={load}
        pacientes={pacientes}
        pacienteId={objetivo?.pacienteId}
        pacienteNombre={objetivo ? `${objetivo.pacienteNombre} · Turno ${numeroTurno(objetivo.numero, objetivo.prefijo)}` : undefined}
      />
    </div>
  );
}
