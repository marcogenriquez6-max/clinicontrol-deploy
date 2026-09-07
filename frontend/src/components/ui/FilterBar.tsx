import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface FilterChip {
  value: string;
  label: string;
  icon?: LucideIcon;
  /** Conteo opcional que se muestra como badge dentro del chip */
  count?: number;
  /** Colores del chip cuando está activo (semántica por estado) */
  activeBg?: string;
  activeText?: string;
  activeBorder?: string;
}

export interface FilterSelect {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string | number; label: string }[];
}

interface FilterBarProps {
  chips?: FilterChip[];
  chipValue?: string;
  onChipChange?: (v: string) => void;
  selects?: FilterSelect[];
  /** Campos adicionales (fechas, texto libre) integrados en la barra */
  extraFilters?: ReactNode;
  resultCount?: number;
  totalCount?: number;
  resultLabel?: string;
  onClear?: () => void;
}

const chipBase =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer select-none';

export default function FilterBar({
  chips = [],
  chipValue,
  onChipChange,
  selects = [],
  extraFilters,
  resultCount,
  totalCount,
  resultLabel = 'resultados',
  onClear,
}: FilterBarProps) {
  const hasActive =
    (chipValue !== undefined && chipValue !== '') || selects.some((s) => s.value !== '');

  return (
    <div
      className="rounded-2xl shadow-sm p-3 flex flex-wrap items-center gap-2"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
    >
      <span className="inline-flex items-center gap-1.5 mr-1">
        <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
          Filtros
        </span>
      </span>

      {chips.map((chip) => {
        const Icon = chip.icon;
        const active = chipValue === chip.value && !!onChipChange;
        return (
          <button
            key={chip.value}
            type="button"
            onClick={() => onChipChange?.(active ? '' : chip.value)}
            className={chipBase}
            style={
              active
                ? {
                    backgroundColor: chip.activeBg ?? 'var(--primary-100)',
                    color: chip.activeText ?? 'var(--primary-700)',
                    borderColor: chip.activeBorder ?? 'var(--primary-500)',
                  }
                : {
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    borderColor: 'transparent',
                  }
            }
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {chip.label}
            {typeof chip.count === 'number' && (
              <span
                className="ml-0.5 min-w-[18px] px-1 rounded-full text-xs font-bold leading-4 text-center"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.55)' : 'var(--bg-tertiary)',
                  color: 'inherit',
                }}
              >
                {chip.count}
              </span>
            )}
          </button>
        );
      })}

      {selects.map((sel, i) => (
        <div key={i} className="relative inline-flex items-center">
          <select
            value={sel.value}
            onChange={(e) => sel.onChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold cursor-pointer focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] transition-colors border"
            style={{
              backgroundColor: sel.value ? 'var(--primary-100)' : 'var(--bg-secondary)',
              color: sel.value ? 'var(--primary-700)' : 'var(--text-secondary)',
              borderColor: sel.value ? 'var(--primary-200)' : 'transparent',
            }}
          >
            <option value="">{sel.placeholder}</option>
            {sel.options.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none"
            style={{ color: sel.value ? 'var(--primary-700)' : 'var(--text-tertiary)' }}
          />
        </div>
      ))}

      {extraFilters}

      <div className="flex items-center gap-3 ml-auto pl-2">
        {hasActive && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-[var(--danger-50)]"
            style={{ color: 'var(--danger-600)' }}
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
        {typeof resultCount === 'number' && typeof totalCount === 'number' && (
          <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{resultCount}</strong> de {totalCount} {resultLabel}
          </span>
        )}
      </div>
    </div>
  );
}
