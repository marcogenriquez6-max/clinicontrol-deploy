import { useState, useEffect, type ReactNode } from 'react';
import { AlertTriangle, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { Modal } from '../ui';
import { toast } from '../ui/Toast';
import { seguridadMedicaService } from '../../api/services';
import { interaccionService } from '../../api/interaccion.service';
import type { ResultadoVerificacion } from '../../types';

interface SafetyVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: number;
  medicamentoIds: number[];
}

const severityColors: Record<string, string> = {
  leve: '#fbbf24',
  moderada: '#f97316',
  severa: '#ef4444',
  contraindicada: '#dc2626',
};

const severityBadgeColors: Record<string, string> = {
  anafilactica: 'bg-[var(--danger-700)]',
  absoluta: 'bg-[var(--danger-700)]',
  critica: 'bg-[var(--danger-700)]',
  contraindicada: 'bg-[var(--danger-700)]',
  severa: 'bg-[var(--danger-500)]',
  moderada: 'bg-[var(--warning-500)]',
  leve: 'bg-[var(--warning-500)]',
};

export default function SafetyVerificationModal({ isOpen, onClose, pacienteId, medicamentoIds }: SafetyVerificationModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultadoVerificacion | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    alergias: true,
    interacciones: true,
    duplicidad: true,
    contraindicaciones: true,
  });

  const toggleSection = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (isOpen && medicamentoIds.length > 0) {
      requestAnimationFrame(() => {
        setLoading(true);
        setResult(null);
      });
      // Seguridad Farmacológica (RF-11): alergias del paciente + interacciones + duplicidad.
      Promise.all([
        interaccionService
          .verificarConPaciente(pacienteId, medicamentoIds)
          .then((r: any) => r.data)
          .catch(() => ({ interacciones: [], alergias: [] })),
        seguridadMedicaService
          .verificarDuplicidad(pacienteId, medicamentoIds)
          .then((r: any) => r.data)
          .catch(() => ({ duplicidad: [] })),
      ])
        .then(([conPaciente, dup]: any[]) => {
          const merged: any = {
            alergias: conPaciente?.alergias || [],
            interacciones: conPaciente?.interacciones || [],
            duplicidad: dup?.duplicidad || [],
            contraindicaciones: [],
          };
          setResult(merged);
          setExpanded({
            alergias: merged.alergias.length > 0,
            interacciones: merged.interacciones.length > 0,
            duplicidad: merged.duplicidad.length > 0,
            contraindicaciones: false,
          });
          if (merged.alergias.length > 0) {
            toast('error', '⚠️ Alerta de alergia', `Paciente alérgico a: ${merged.alergias.map((a: any) => a.nombre).join(', ')}`);
          }
        })
        .catch(() => {
          setResult(null);
          toast('error', 'Error', 'No se pudo completar la verificación.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, pacienteId, medicamentoIds]);

  const severityBadge = (severidad: string) => {
    const color = severityBadgeColors[severidad] || 'bg-[var(--neutral-500)]';
    return `${color} px-2 py-0.5 rounded text-xs font-bold text-white text-center min-w-[70px]`;
  };

  const renderSection = (
    key: string,
    title: string,
    iconColor: string,
    bgColor: string,
    borderColor: string,
    data: any[] | undefined,
    renderItem: (item: any, idx: number) => ReactNode,
    emptyText: string,
  ) => (
    <div className={`border ${borderColor} rounded-lg overflow-hidden`}>
      <button
        onClick={() => toggleSection(key)}
        className={`w-full flex items-center justify-between px-4 py-3 ${bgColor} hover:opacity-90 transition-colors`}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
          <span className={`font-semibold ${iconColor.replace('text-', 'text-').replace('500', '800')}`}>{title}</span>
          {data && data.length > 0 && (
            <span className={`px-2 py-0.5 ${iconColor.replace('text-', 'bg-')} text-white text-xs rounded-full`}>
              {data.length}
            </span>
          )}
        </div>
        {expanded[key] ? <ChevronDown className={`w-5 h-5 ${iconColor}`} /> : <ChevronRight className={`w-5 h-5 ${iconColor}`} />}
      </button>
      {expanded[key] && (
        <div className="px-4 py-3 space-y-2">
          {!data || data.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] italic">{emptyText}</p>
          ) : (
            data.map(renderItem)
          )}
        </div>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verificación de Seguridad Médica" size="xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-600)]" />
          <span className="ml-3 text-[var(--text-secondary)]">Verificando seguridad...</span>
        </div>
      ) : result ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { label: 'Alergias', count: result.alergias?.length || 0, color: result.alergias?.length ? 'bg-[var(--danger-100)] text-[var(--danger-700)] border-[var(--danger-200)]' : 'bg-[var(--success-100)] text-[var(--success-700)] border-[var(--success-200)]' },
              { label: 'Interacciones', count: result.interacciones?.length || 0, color: result.interacciones?.length ? 'bg-[var(--warning-100)] text-orange-700 border-orange-300' : 'bg-[var(--success-100)] text-[var(--success-700)] border-[var(--success-200)]' },
              { label: 'Duplicidades', count: result.duplicidad?.length || 0, color: result.duplicidad?.length ? 'bg-[var(--warning-100)] text-yellow-700 border-yellow-300' : 'bg-[var(--success-100)] text-[var(--success-700)] border-[var(--success-200)]' },
              { label: 'Contraindicaciones', count: result.contraindicaciones?.length || 0, color: result.contraindicaciones?.length ? 'bg-[var(--danger-100)] text-[var(--danger-700)] border-[var(--danger-200)]' : 'bg-[var(--success-100)] text-[var(--success-700)] border-[var(--success-200)]' },
            ].map(s => (
              <span key={s.label} className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${s.color}`}>
                {s.count} {s.label}
              </span>
            ))}
          </div>

          {renderSection('alergias', 'Alergias del Paciente', 'text-[var(--danger-600)]', 'bg-[var(--danger-50)]', 'border-[var(--danger-200)]', result.alergias,
            (a: any, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-[var(--bg-card)] rounded border border-[var(--danger-100)]">
                <span className={`${severityBadge(a.severidad)}`}>{a.severidad?.toUpperCase()}</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{a.nombre}</span>
                {a.descripcion && <span className="text-sm text-[var(--text-tertiary)] ml-1">({a.descripcion})</span>}
              </div>
            ), 'No se encontraron alergias registradas.'
          )}

          {renderSection('interacciones', 'Interacciones Medicamentosas', 'text-orange-600', 'bg-orange-50', 'border-orange-200', result.interacciones,
            (i: any, idx) => (
              <div key={idx} className="p-3 bg-[var(--bg-card)] rounded border" style={{ borderLeft: `4px solid ${severityColors[i.severidad] || '#6b7280'}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${severityBadgeColors[i.severidad] || 'bg-[var(--neutral-500)]'}`}>
                    {i.severidad?.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium">{i.medicamento1} ↔ {i.medicamento2}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{i.descripcion}</p>
                {i.recomendacion && <p className="text-sm text-[var(--text-tertiary)] mt-1">Recomendación: {i.recomendacion}</p>}
              </div>
            ), 'No se encontraron interacciones entre los medicamentos.'
          )}

          {renderSection('duplicidad', 'Duplicidad Terapéutica', 'text-[var(--warning-600)]', 'bg-[var(--warning-50)]', 'border-[var(--warning-200)]', result.duplicidad,
            (d: any, idx) => (
              <div key={idx} className="p-3 bg-[var(--bg-card)] rounded border border-[var(--warning-200)]" style={{ borderLeft: `4px solid ${severityColors[d.severidad] || '#6b7280'}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${severityBadgeColors[d.severidad] || 'bg-[var(--neutral-500)]'}`}>
                    {d.severidad?.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-yellow-800">{d.tipo}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{d.mensaje}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">{d.medicamento1}{d.medicamento2 && d.medicamento2 !== d.medicamento1 ? ` / ${d.medicamento2}` : ''}</p>
              </div>
            ), 'No se detectó duplicidad terapéutica.'
          )}

          {renderSection('contraindicaciones', 'Contraindicaciones', 'text-[var(--danger-600)]', 'bg-[var(--danger-50)]', 'border-[var(--danger-200)]', result.contraindicaciones,
            (c: any, idx) => (
              <div key={idx} className="p-3 bg-[var(--bg-card)] rounded border border-[var(--danger-100)]" style={{ borderLeft: `4px solid ${severityColors[c.severidad] || '#6b7280'}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${severityBadgeColors[c.severidad] || 'bg-[var(--neutral-500)]'}`}>
                    {c.severidad?.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium">{c.medicamento}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{c.condicion}</p>
                {c.descripcion && <p className="text-sm text-[var(--text-tertiary)] mt-1">{c.descripcion}</p>}
              </div>
            ), 'No se encontraron contraindicaciones.'
          )}

          {result.alergias?.length === 0 && result.interacciones?.length === 0 && result.duplicidad?.length === 0 && result.contraindicaciones?.length === 0 && (
            <div className="text-center py-8">
              <Shield className="w-16 h-16 text-[var(--success-500)] mx-auto mb-3" />
              <p className="text-lg font-semibold text-[var(--success-700)]">Verificación completada</p>
              <p className="text-sm text-[var(--text-tertiary)]">No se encontraron problemas de seguridad médica.</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-[var(--text-tertiary)]">No hay resultados disponibles.</p>
      )}
    </Modal>
  );
}
