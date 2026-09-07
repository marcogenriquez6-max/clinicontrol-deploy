import { useEffect, useState } from 'react';
import { User, AlertTriangle, Droplets, Calendar, Shield } from 'lucide-react';
import { pacienteExtraService } from '../../api/services';
import type { PerfilPaciente, Alergia } from '../../types';

interface BandaPacienteProps {
  pacienteId?: number | string | null;
}

export default function BandaPaciente({ pacienteId }: BandaPacienteProps) {
  const [perfil, setPerfil] = useState<PerfilPaciente | null>(null);
  const [alergias, setAlergias] = useState<Alergia[]>([]);
  const [loading, setLoading] = useState(false);

  const id = pacienteId ? Number(pacienteId) : 0;

  useEffect(() => {
    if (!id) return;
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const [perfilRes, alergiasRes] = await Promise.all([
          pacienteExtraService.getPerfil(id),
          pacienteExtraService.getAlergias(id),
        ]);
        if (cancel) return;
        setPerfil(perfilRes.data || null);
        setAlergias(alergiasRes.data ?? []);
      } catch {
        if (!cancel) {
          setPerfil(null);
          setAlergias([]);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  if (!id) return null;

  const esAlergiaCritica = alergias.some((a) => {
    const s = (a.severidad || a.tipoAlergia?.severidadBase || '').toLowerCase();
    return s === 'severa' || s === 'anafilactica' || s === 'critica';
  });

  return (
    <div
      className="w-full rounded-lg border px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 sticky top-0 z-20 shadow-sm"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: alergias.length > 0 ? (esAlergiaCritica ? 'var(--danger-500)' : 'var(--warning-500)') : 'var(--border-primary)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)' }}>
          <User className="w-4 h-4" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {perfil?.nombreCompleto || 'Cargando...'}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            CI: {perfil?.ci || '—'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
        <span style={{ color: 'var(--text-secondary)' }}>
          {perfil?.edad != null ? `${perfil.edad} años` : '—'}
        </span>
        <span aria-hidden="true" style={{ color: 'var(--border-primary)' }}>·</span>
        <span style={{ color: 'var(--text-secondary)' }}>{perfil?.genero || '—'}</span>
      </div>

      <div className="flex items-center gap-2">
        <Droplets className="w-4 h-4" style={{ color: 'var(--danger-500)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {perfil?.grupoSanguineo || '—'}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-[180px]">
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Cargando alergias...</p>
        ) : alergias.length === 0 ? (
          <p className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Shield className="w-4 h-4" style={{ color: 'var(--success-600)' }} />
            Sin alergias registradas
          </p>
        ) : (
          <>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase" style={{ color: esAlergiaCritica ? 'var(--danger-600)' : 'var(--warning-600)' }}>
              <AlertTriangle className="w-4 h-4" />
              Alergias:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {alergias.map((a, idx) => (
                <span
                  key={a.id ?? idx}
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: 'var(--danger-100)', color: 'var(--danger-700)' }}
                >
                  {a.nombre}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
