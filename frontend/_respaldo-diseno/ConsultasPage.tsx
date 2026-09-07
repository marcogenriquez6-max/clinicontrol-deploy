import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Clock, CheckCircle2, ArrowRight, Search, Banknote, UserRound } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { turnoService } from '../api/services';
import type { Turno } from '../types';

const padNumero = (n: number | string) => String(n).padStart(3, '0');

function StatusPill({ enAtencion }: { enAtencion: boolean }) {
  return enAtencion ? (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-700)' }}
    >
      <span className="relative flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--success-500)' }} />
      </span>
      En Atención
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: 'var(--warning-50)', color: 'var(--warning-700)' }}
    >
      <Clock className="w-3 h-3" /> En Espera
    </span>
  );
}

function TurnoCard({ turno, modo, onAtender, onContinuar }: {
  turno: Turno;
  modo: 'atencion' | 'espera';
  onAtender: (t: Turno) => void;
  onContinuar: (t: Turno) => void;
}) {
  const esAtencion = modo === 'atencion';
  return (
    <div
      className="rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden bg-[var(--bg-card)] dark:bg-[var(--bg-card)]"
      style={{ borderColor: esAtencion ? 'var(--success-300)' : 'var(--border-secondary)' }}
    >
      {/* Franja superior de color */}
      <div className="h-1" style={{ backgroundColor: esAtencion ? 'var(--success-500)' : 'var(--warning-400)' }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Cabecera: estado + número de ficha */}
        <div className="flex items-start justify-between gap-2">
          <StatusPill enAtencion={esAtencion} />
          <div className="text-right leading-none">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white px-2 py-0.5 rounded-t-md inline-block" style={{ backgroundColor: 'var(--primary-600)' }}>Turno</p>
            <p className="text-xl font-extrabold px-2 pb-0.5 rounded-b-md" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)' }}>
              #{padNumero(turno.numero)}
            </p>
          </div>
        </div>

        {/* Paciente */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)' }}>
              {turno.pacienteNombre?.charAt(0)}{turno.pacienteNombre?.split(' ')[1]?.charAt(0) || ''}
            </span>
            <p className="font-bold text-sm text-[var(--text-primary)] truncate">{turno.pacienteNombre}</p>
          </div>
          <p className="text-xs mt-1.5 text-[var(--text-secondary)]">
            <span className="font-medium">CI:</span> {turno.pacienteCI}
            <span className="mx-1.5" style={{ color: 'var(--neutral-300)' }}>·</span>
            <span className="capitalize">{turno.tipo || 'consulta'}</span>
          </p>
          {(turno.medicoNombre || turno.especialidad) && (
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--info-700)' }}>
              <Stethoscope className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--info-500)' }} />
              <span className="truncate">Dr. {turno.medicoNombre}{turno.especialidad ? ` · ${turno.especialidad}` : ''}</span>
            </p>
          )}
        </div>

        {/* Estado de pago */}
        <div className="mt-auto pt-1">
          {turno.pagado && turno.monto > 0 ? (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold"
              style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-700)' }}
            >
              <Banknote className="w-3.5 h-3.5" /> Pagado Bs. {Number(turno.monto).toFixed(2)}
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}
            >
              Pago pendiente de verificación
            </span>
          )}
        </div>

        {/* Acción rápida */}
        {esAtencion ? (
          <Button variant="secondary" className="w-full justify-center" onClick={() => onContinuar(turno)}>
            <UserRound className="w-4 h-4" /> Ver Consulta
          </Button>
        ) : (
          <Button className="w-full justify-center group" onClick={() => onAtender(turno)}>
            Atender Paciente
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ConsultasPage() {
  const navigate = useNavigate();
  const [pendientes, setPendientes] = useState<Turno[]>([]);
  const [enAtencion, setEnAtencion] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await turnoService.getAll({ limit: 200 });
      const turnos: Turno[] = Array.isArray(res) ? res : ((res as { data?: Turno[] })?.data ?? []);
      setPendientes(turnos.filter((t) => t.pagado && t.estado === 'espera'));
      setEnAtencion(turnos.filter((t) => t.estado === 'atencion'));
    } catch {
      toast('error', 'Error al cargar la cola de pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(loadQueue, 0);
    return () => clearTimeout(t);
  }, []);

  const handleAtender = async (turno: Turno) => {
    try {
      await turnoService.updateEstado(Number(turno.id), 'atencion');
      navigate('/consulta-completa', {
        state: {
          pacienteId: turno.pacienteId,
          pacienteNombre: turno.pacienteNombre,
          medicoId: turno.medicoId,
          turnoId: turno.id,
          turnoNumero: turno.numero,
        },
      });
    } catch {
      toast('error', 'Error al iniciar atención');
    }
  };

  const handleContinuar = (turno: Turno) => {
    navigate('/consulta-completa', {
      state: {
        pacienteId: turno.pacienteId,
        pacienteNombre: turno.pacienteNombre,
        medicoId: turno.medicoId,
        turnoId: turno.id,
        turnoNumero: turno.numero,
      },
    });
  };

  const filterBySearch = (items: Turno[]): Turno[] => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(t =>
      t.pacienteNombre?.toLowerCase().includes(term) ||
      t.pacienteCI?.includes(term) ||
      String(t.numero).includes(term)
    );
  };

  const filteredPendientes = filterBySearch(pendientes);
  const filteredEnAtencion = filterBySearch(enAtencion);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        icon={Stethoscope}
        title="Consultas"
        subtitle="Tablero clínico — pacientes listos para atención médica"
        stats={[{ label: 'En atención', value: enAtencion.length }, { label: 'En espera', value: pendientes.length }]}
      />


      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-quaternary)' }} />
        <input
          type="text"
          placeholder="Buscar por nombre, CI o turno..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
          ))}
        </div>
      ) : (
        <>
          {/* Sección: En Atención */}
          <section>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--success-700)' }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: 'var(--success-500)' }} />
              </span>
              En Atención ({filteredEnAtencion.length})
            </h2>
            {filteredEnAtencion.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-tertiary)' }}>
                Ningún paciente en atención en este momento
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEnAtencion.map(t => (
                  <TurnoCard key={t.id} turno={t} modo="atencion" onAtender={handleAtender} onContinuar={handleContinuar} />
                ))}
              </div>
            )}
          </section>

          {/* Sección: En Espera */}
          <section className="pt-2">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--warning-700)' }}>
              <Clock className="w-4 h-4" /> En Espera · Pagados ({filteredPendientes.length})
            </h2>
            {filteredPendientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed" style={{ borderColor: 'var(--border-primary)' }}>
                <CheckCircle2 className="w-12 h-12 mb-3" style={{ color: 'var(--primary-200)' }} />
                <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>No hay pacientes pendientes</p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Los pacientes pagados aparecerán aquí automáticamente</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPendientes.map(t => (
                  <TurnoCard key={t.id} turno={t} modo="espera" onAtender={handleAtender} onContinuar={handleContinuar} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
