import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Search,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card, Input } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { turnoService } from '../api/services';
import type { Turno } from '../types';

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
      className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden bg-[var(--bg-card)] dark:bg-[var(--bg-card)]"
      style={{ borderColor: esAtencion ? 'var(--success-300)' : 'var(--border-secondary)' }}
    >
      {/* Franja superior de color */}
      <div className="h-1" style={{ backgroundColor: esAtencion ? 'var(--success-500)' : 'var(--warning-400)' }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Cabecera: estado + número de ficha */}
        <div className="flex items-start justify-between gap-2">
          <StatusPill enAtencion={esAtencion} />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{turno.pacienteNombre} {turno.pacienteApellido}</p>
            <p className="text-xs text-[var(--text-tertiary)]">
              CI: {turno.pacienteCI || '—'}
            </p>
          </div>
        </div>

        {/* Información clínica */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">Urgencia</p>
            <p className="font-medium {turno.esUrgencia ? 'var(--danger-600)' : 'var(--text-tertiary)'}">
              {turno.esUrgencia ? 'Urgencia — atención sin cobro previo' : 'Pago completado'}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">Dr.</p>
            <p className="font-medium text-[var(--text-primary)]">
              Dr. {turno.medicoNombre || '—'}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          {modo === 'espera' ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onAtender(turno)}
              className="flex-1"
            >
              Atender
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onContinuar(turno)}
              className="flex-1"
            >
              Continuar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface Filtro {
  texto: string;
  tipo: 'nombre' | 'ci' | 'turno';
}

export default function ConsultasPage() {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [filtro, setFiltro] = useState<Filtro>({ texto: '', tipo: 'nombre' });
  const [modo, setModo] = useState<'atencion' | 'espera'>('espera');
  const [escribiendo] = useState(false);

  // Cargar turnos según el modo
  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const data = await turnoService.getAll({});
        setTurnos(data.data || []);
      } catch (e) {
        toast('error', 'Error al cargar turnos', (e as Error).message);
      }
    };
    cargarTurnos();
  }, []);

  // Filtrar turnos
  const filteredTurnos = turnos.filter(t => {
    if (!filtro.texto) return true;
    const lower = filtro.texto.toLowerCase();
    if (filtro.tipo === 'nombre') {
      return (
        (t.pacienteNombre + ' ' + (t.pacienteApellido || '')).toLowerCase().includes(lower)
      );
    }
    if (filtro.tipo === 'ci') {
      return (t.pacienteCI || '').toLowerCase().includes(lower);
    }
    if (filtro.tipo === 'turno') {
      return String(t.numero).includes(lower);
    }
    return true;
  });

  // Separar por estado de pago/urgencia
  const pendientes = filteredTurnos.filter(t => !t.pagado && !t.esUrgencia);
  const pagados = filteredTurnos.filter(t => t.pagado);
  const urgentes = filteredTurnos.filter(t => !t.pagado && t.esUrgencia);

  const handleAtender = async (turno: Turno) => {
    try {
      await turnoService.updateEstado(turno.id, 'atencion');
      toast('success', `Llamando al turno #${turno.numero}`);
      navigate('/consulta-completa', { state: { turno } });
    } catch (e: any) {
      const message = e?.message || 'Error desconocido';
      /* ── Manejo específico de la regla de cobro previo ─────────────────── */
      if (message.includes('no está pagado') || message.includes('cobro previo')) {
        toast('error', 'Cobro pendiente', message);
        return;
      }
      /* ── Errores genéricos ──────────────────────────────────────────── */
      toast('error', 'Error al atender', message);
    }
  };

  const handleContinuar = (turno: Turno) => {
    navigate('/consulta-completa', { state: { turno } });
  };


  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <PageHeader
        icon={Clock}
        title="Tablero de Consultas"
        subtitle="Su cola de atención — Dr. {{usuario}} · solo pacientes con pago registrado"
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setModo(modo === 'espera' ? 'atencion' : 'espera')}
          >
            {modo === 'espera' ? 'Ver Pagados' : 'Ver En Espera'}
          </Button>
        }
      />

      <Card className="mt-4">
        <div className="p-4 flex items-center gap-2">
          <Search className="w-6 h-6" />
          <Input
            placeholder="Buscar por nombre, CI o turno..."
            value={filtro.texto}
            onChange={(e) => setFiltro({ texto: e.target.value, tipo: filtro.tipo })}
            disabled={escribiendo}
          />
        </div>

        {/* Resumen superior */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-3 rounded-xl bg-[var(--primary-50)] text-center">
            <p className="text-xs text-[var(--text-tertiary)]">En Espera</p>
            <p className="text-xl font-bold text-[var(--primary-600)]">{pendientes.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--success-50)] text-center">
            <p className="text-xs text-[var(--text-tertiary)]">Pagados</p>
            <p className="text-xl font-bold text-[var(--success-600)]">{pagados.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--danger-50)] text-center">
            <p className="text-xs text-[var(--text-tertiary)]">Urgencia</p>
            <p className="text-xl font-bold text-[var(--danger-600)]">{urgentes.length}</p>
          </div>
        </div>

        {/* Lista de turnos en espera */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-[var(--text-tertiary)] mb-2">
            En Espera · Pagados ({pendientes.length})
          </h3>
          {pendientes.length === 0 && (
            <p className="text-sm text-[var(--text-tertiary)] px-4 py-2">
              No hay pacientes pagados asignados a usted en este momento.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {pendientes.map((t) => (
              <TurnoCard key={t.id} turno={t} modo="espera" onAtender={handleAtender} onContinuar={handleContinuar} />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
