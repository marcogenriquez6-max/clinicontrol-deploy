import { AlertTriangle, Ban, ShieldAlert, Info } from 'lucide-react';

export type PharmaSeverity = 'contraindicado' | 'grave' | 'precaucion' | 'info';

interface SeverityStyle {
  bg: string;
  border: string;
  text: string;
  accent: string;
  label: string;
  icon: typeof Ban;
}

const SEVERITY: Record<PharmaSeverity, SeverityStyle> = {
  contraindicado: {
    bg: 'var(--alert-critical-bg)',
    border: 'var(--alert-critical-border)',
    text: 'var(--alert-critical-text)',
    accent: 'var(--alert-critical-accent)',
    label: 'CONTRAINDICADO',
    icon: Ban,
  },
  grave: {
    bg: 'var(--alert-major-bg)',
    border: 'var(--alert-major-border)',
    text: 'var(--alert-major-text)',
    accent: 'var(--alert-major-accent)',
    label: 'INTERACCIÓN GRAVE',
    icon: ShieldAlert,
  },
  precaucion: {
    bg: 'var(--alert-caution-bg)',
    border: 'var(--alert-caution-border)',
    text: 'var(--alert-caution-text)',
    accent: 'var(--alert-caution-accent)',
    label: 'PRECAUCIÓN',
    icon: AlertTriangle,
  },
  info: {
    bg: 'var(--info-50)',
    border: 'var(--info-200)',
    text: 'var(--info-700)',
    accent: 'var(--info-500)',
    label: 'INFORMACIÓN',
    icon: Info,
  },
};

export interface PharmaAlert {
  severity: PharmaSeverity;
  title: string;
  detail?: string;
  source?: string;
}

interface PharmaAlertCardProps {
  alert: PharmaAlert;
  onOverride?: () => void;
}

export default function PharmaAlertCard({ alert, onOverride }: PharmaAlertCardProps) {
  const s = SEVERITY[alert.severity] ?? SEVERITY.info;
  const Icon = s.icon;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-xl border-l-4 p-4 shadow-sm"
      style={{ backgroundColor: s.bg, borderColor: s.border, borderLeftColor: s.accent }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0" style={{ color: s.accent }}>
          <Icon className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold tracking-wider" style={{ color: s.accent }}>
            {s.label}
          </p>
          <p className="text-sm font-bold mt-0.5" style={{ color: s.text }}>
            {alert.title}
          </p>
          {alert.detail && (
            <p className="text-sm mt-1 leading-relaxed" style={{ color: s.text }}>
              {alert.detail}
            </p>
          )}
          {alert.source && (
            <p className="text-xs mt-1.5 opacity-75" style={{ color: s.text }}>
              Fuente: {alert.source}
            </p>
          )}
        </div>
        {onOverride && alert.severity === 'contraindicado' && (
          <button
            onClick={onOverride}
            className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-85"
            style={{ backgroundColor: s.accent, color: '#fff' }}
          >
            Justificar y continuar
          </button>
        )}
      </div>
    </div>
  );
}

export function PharmaAlertList({
  alerts,
  onOverride,
}: {
  alerts: PharmaAlert[];
  onOverride?: (a: PharmaAlert) => void;
}) {
  if (alerts.length === 0) return null;
  const order: PharmaSeverity[] = ['contraindicado', 'grave', 'precaucion', 'info'];
  const sorted = [...alerts].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
  return (
    <div className="space-y-2">
      {sorted.map((a, i) => (
        <PharmaAlertCard key={`${a.severity}-${i}`} alert={a} onOverride={onOverride ? () => onOverride(a) : undefined} />
      ))}
    </div>
  );
}
