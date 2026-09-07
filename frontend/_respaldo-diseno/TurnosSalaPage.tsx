import { useState, useEffect } from 'react';
import { Users, Play, CheckCircle, XCircle, Clock, Bell, Search } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { turnoService, consultaService } from '../api/services';

const ESTADOS = ['todos', 'espera', 'llamado', 'atencion', 'completado', 'cancelado'] as const;
const ESTADO_LABEL: Record<string, string> = {
  todos: 'Todos',
  espera: 'En Espera',
  llamado: 'Llamado',
  atencion: 'En Atención',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

export default function TurnosSalaPage() {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [tiempoReal, setTiempoReal] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const fetchTurnos = async () => {
    try {
      const res = await turnoService.getAll({ limit: 100 });
      const data = Array.isArray(res) ? res : (res as any)?.data ?? [];
      setTurnos(data);
    } catch { /* sin conexion: se reintenta automaticamente */ }
  };

  useEffect(() => {
    const t = setTimeout(fetchTurnos, 0);
    if (tiempoReal) {
      const interval = setInterval(fetchTurnos, 5000);
      return () => { clearTimeout(t); clearInterval(interval); };
    }
  }, [tiempoReal]);

  const llamarTurno = async (turno: any) => {
    try {
      await turnoService.updateEstado(turno.id, 'llamado');
      fetchTurnos();
      toast('info', `Turno #${turno.numero} llamado`, `Consultorio asignado`);
      try {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(
          `Paciente ${turno.pacienteNombre}, turno número ${turno.numero}, pasar al consultorio`
        );
        utterance.lang = 'es-BO';
        utterance.rate = 0.9;
        utterance.volume = 0.8;
        synth.speak(utterance);
      } catch { /* sintesis de voz no disponible */ }
    } catch {
      toast('error', 'Error al llamar turno');
    }
  };

  const iniciarAtencion = async (turno: any) => {
    try {
      await turnoService.updateEstado(turno.id, 'atencion');
      try {
        await consultaService.create({
          pacienteId: turno.pacienteId,
          medicoId: turno.medicoId,
          motivo: turno.tipo || 'consulta',
          sintomas: '',
          examenFisico: '',
        });
      } catch { /* sin signos previos que limpiar */ }
      fetchTurnos();
      toast('success', `Atendiendo turno #${turno.numero}`);
    } catch {
      toast('error', 'Error al iniciar atención');
    }
  };

  const completarTurno = async (turno: any) => {
    try {
      await turnoService.updateEstado(turno.id, 'completado');
      fetchTurnos();
      toast('success', `Turno #${turno.numero} completado`);
    } catch {
      toast('error', 'Error al completar turno');
    }
  };

  const cancelarTurno = async (turno: any) => {
    try {
      await turnoService.updateEstado(turno.id, 'cancelado');
      fetchTurnos();
      toast('info', `Turno #${turno.numero} cancelado`);
    } catch {
      toast('error', 'Error al cancelar turno');
    }
  };

  const turnosConPacienteNombre = turnos.filter(t => t.pacienteNombre);
  const turnosFiltrados = turnosConPacienteNombre.filter(t => {
    if (filterEstado !== 'todos' && t.estado !== filterEstado) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const nombre = `${t.pacienteNombre || ''} ${t.pacienteCI || ''} ${t.medicoNombre || ''} ${t.numero || ''}`.toLowerCase();
      if (!nombre.includes(q)) return false;
    }
    return true;
  });

  const badgeVariant = (estado: string) => {
    if (estado === 'espera') return 'warning';
    if (estado === 'llamado') return 'info';
    if (estado === 'atencion') return 'primary';
    if (estado === 'completado') return 'success';
    return 'danger';
  };

  const badgeLabel = (estado: string) => {
    if (estado === 'espera') return 'En Espera';
    if (estado === 'llamado') return 'Llamado';
    if (estado === 'atencion') return 'En Atención';
    if (estado === 'completado') return 'Completado';
    return 'Cancelado';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[var(--bg-card)] rounded-lg border border-[var(--border-primary)] shadow-sm p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg text-white flex items-center justify-center" style={{ backgroundColor: 'var(--primary-700)' }}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Sala de Espera</h1>
            <p className="text-sm text-[var(--text-secondary)]">Control de pacientes en tiempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--warning-50)] rounded-lg border border-[var(--warning-200)]">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-[var(--warning-700)]">{turnos.filter(t => t.estado === 'espera').length} esperando</span>
          </div>
          <Badge variant="primary">{turnos.filter(t => t.estado === 'atencion').length} en atención</Badge>
          <Badge variant="success">{turnos.filter(t => t.estado === 'completado').length} completados</Badge>
          <button
            onClick={() => setTiempoReal(!tiempoReal)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tiempoReal ? 'bg-[var(--success-50)] text-[var(--success-700)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
          >
            {tiempoReal ? '● Tiempo Real' : 'Pausado'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <Card accent="accent">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Paciente, CI, médico o #turno..."
                className="w-full pl-9 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary-500)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Estado</label>
            <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-500)]">
              {ESTADOS.map(e => (
                <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-[var(--text-tertiary)] py-2">
            {turnosFiltrados.length} de {turnosConPacienteNombre.length} turnos
          </div>
        </div>
      </Card>

      {/* Lista completa de turnos */}
      <Card>
        {turnosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-[var(--text-tertiary)]">
            <Users className="w-12 h-12 text-[var(--text-tertiary)]" />
            <p className="text-sm font-medium">No hay turnos</p>
            {searchTerm && <p className="text-xs">Intente con otros criterios de búsqueda</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {turnosFiltrados.map(t => (
              <div key={t.id || t.numero} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-primary)] hover:border-[var(--primary-300)] hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  {/* Número de turno */}
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 ${
                    t.estado === 'atencion'
                      ? 'bg-[var(--success-500)] ring-2 ring-[var(--success-200)]'
                      : t.estado === 'llamado'
                      ? 'bg-[var(--primary-600)] ring-2 ring-[var(--primary-200)]'
                      : t.estado === 'completado'
                      ? 'bg-[var(--neutral-400)]'
                      : t.estado === 'cancelado'
                      ? 'bg-[var(--danger-500)]'
                      : 'bg-[var(--warning-50)]0'
                  }`}>
                    #{t.numero}
                  </div>

                  {/* Información del paciente */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[var(--text-primary)]">{t.pacienteNombre || '—'}</p>
                      <span className="text-xs text-[var(--text-tertiary)]">{t.pacienteCI || ''}</span>
                      {t.esEmergencia && <Badge variant="danger" className="text-[10px]">Emergencia</Badge>}
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      {t.medicoNombre || 'Sin médico'}
                      {t.especialidad ? ` · ${t.especialidad}` : ''}
                      {t.consultorio ? ` · Consultorio ${t.consultorio}` : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {badgeLabel(t.estado) && <Badge variant={badgeVariant(t.estado)} className="text-[10px]">{badgeLabel(t.estado)}</Badge>}
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        {t.createdAt || t.creadoEn ? new Date(t.createdAt || t.creadoEn).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {t.estado === 'espera' && (
                    <Button size="sm" onClick={() => llamarTurno(t)}>
                      <Bell className="w-4 h-4" /> Llamar
                    </Button>
                  )}
                  {t.estado === 'llamado' && (
                    <Button size="sm" variant="primary" onClick={() => iniciarAtencion(t)}>
                      <Play className="w-4 h-4" /> Iniciar
                    </Button>
                  )}
                  {t.estado === 'atencion' && (
                    <>
                      <Button size="sm" variant="success" onClick={() => completarTurno(t)}>
                        <CheckCircle className="w-4 h-4" /> Completar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => cancelarTurno(t)} className="hover:text-[var(--danger-500)]">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {(t.estado === 'espera' || t.estado === 'llamado') && (
                    <Button size="sm" variant="ghost" onClick={() => cancelarTurno(t)} className="hover:text-[var(--danger-500)]">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
