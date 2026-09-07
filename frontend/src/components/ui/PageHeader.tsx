import type { ReactNode, ElementType } from 'react';

interface PageHeaderProps {
  icon: ElementType;
  gradient?: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
  stats?: { label: string; value: string | number }[];
  badge?: string;
}

export default function PageHeader({ icon: Icon, title, subtitle, action, stats, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--primary-50)] text-[var(--primary-700)]">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight truncate">{title}</h1>
              {badge && (
                <span className="shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[var(--primary-50)] text-[var(--primary-700)] border border-[var(--primary-200)]">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] truncate">{subtitle}</p>
          </div>
        </div>
        {stats && (
          <div className="flex items-center gap-6 mt-3 ml-11">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">{s.value}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
