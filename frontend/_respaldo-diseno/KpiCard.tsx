import type { ElementType } from 'react';

interface KpiCardProps {
  icon: ElementType;
  label: string;
  value: string | number;
  color?: string;
  badge?: string;
  trend?: { value: string; up: boolean };
  max?: number;
  loading?: boolean;
}

const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
  blue: { bg: 'bg-[var(--primary-50)] dark:bg-blue-900/20', icon: 'text-[var(--primary-600)] dark:text-[var(--primary-400)]', text: 'text-[var(--primary-700)] dark:text-[var(--primary-300)]' },
  emerald: { bg: 'bg-[var(--success-50)] dark:bg-emerald-900/20', icon: 'text-[var(--success-600)] dark:text-[var(--success-500)]', text: 'text-[var(--success-700)] dark:text-emerald-300' },
  violet: { bg: 'bg-[var(--fuchsia-50)]', icon: 'text-[var(--fuchsia-600)]', text: 'text-[var(--fuchsia-700)]' },
  amber: { bg: 'bg-[var(--warning-50)] dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400', text: 'text-[var(--warning-700)] dark:text-amber-300' },
  rose: { bg: 'bg-[var(--rose-50)]', icon: 'text-[var(--rose-600)]', text: 'text-[var(--rose-700)]' },
  cyan: { bg: 'bg-[var(--accent-50)]', icon: 'text-[var(--accent-600)]', text: 'text-[var(--accent-700)]' },
};

export default function KpiCard({ icon: Icon, label, value, color = 'blue', badge, trend, max, loading }: KpiCardProps) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-primary)] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${c.bg} ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${c.bg} ${c.text}`}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-[var(--text-secondary)] mb-1">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          {loading ? (
            <span className="inline-block w-12 h-7 bg-[var(--bg-tertiary)] rounded animate-pulse" />
          ) : (
            typeof value === 'string' ? value : (value ?? 0).toLocaleString()
          )}
        </p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-xs font-medium ${trend.up ? 'text-[var(--success-600)]' : 'text-[var(--danger-600)]'}`}>
              {trend.up ? '↑' : '↓'} {trend.value}
            </span>
          </div>
        )}
        {max != null && (
          <div className="mt-3 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--primary-500)]"
              style={{ width: `${Math.min(100, ((Number(value) || 0) / max) * 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
