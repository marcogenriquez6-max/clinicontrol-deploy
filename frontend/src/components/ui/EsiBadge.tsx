import { esiMeta } from './esi';

interface EsiBadgeProps {
  nivel: number | string;
  size?: 'sm' | 'md';
}

export default function EsiBadge({ nivel, size = 'md' }: EsiBadgeProps) {
  const meta = esiMeta(nivel);
  return (
    <span
      title={`ESI ${meta.label} — ${meta.desc}`}
      className={`inline-flex items-center gap-1.5 rounded-lg font-bold border ${size === 'sm' ? 'px-2 py-0.5 text-sm' : 'px-2.5 py-1 text-sm'}`}
      style={{ backgroundColor: meta.bg, color: meta.text, borderColor: meta.accent }}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.accent }} />
      {meta.label}
    </span>
  );
}
