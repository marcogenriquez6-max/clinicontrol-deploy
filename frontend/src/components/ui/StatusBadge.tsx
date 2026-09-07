interface StatusBadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: string;
  dot?: boolean;
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, string> = {
  success: 'bg-[var(--success-100)] text-[var(--success-700)] border border-[var(--success-200)] dark:bg-[var(--success-50)] dark:text-[var(--success-500)] dark:border-[var(--success-100)]',
  warning: 'bg-[var(--warning-100)] text-[var(--warning-700)] border border-[var(--warning-200)] dark:bg-[var(--warning-50)] dark:text-[var(--warning-500)] dark:border-[var(--warning-100)]',
  danger: 'bg-[var(--danger-100)] text-[var(--danger-700)] border border-[var(--danger-200)] dark:bg-[var(--danger-50)] dark:text-[var(--danger-500)] dark:border-[var(--danger-100)]',
  info: 'bg-[var(--info-100)] text-[var(--info-700)] border border-[var(--info-200)] dark:bg-[var(--info-50)] dark:text-[var(--info-500)] dark:border-[var(--info-100)]',
  neutral: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)]',
};

const dotColors: Record<string, string> = {
  success: 'bg-[var(--success-500)]',
  warning: 'bg-[var(--warning-500)]',
  danger: 'bg-[var(--danger-500)]',
  info: 'bg-[var(--info-500)]',
  neutral: 'bg-[var(--neutral-400)]',
};

export default function StatusBadge({ variant, children, dot = false, size = 'sm' }: StatusBadgeProps) {
  const sizes = { sm: 'px-2.5 py-0.5 text-xs', md: 'px-3 py-1 text-sm' };
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variantStyles[variant]} ${sizes[size]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

export function severityToStatus(severidad: string): 'success' | 'warning' | 'danger' | 'info' {
  switch (severidad) {
    case 'leve': return 'success';
    case 'moderada': return 'warning';
    case 'severa': case 'anafilactica': case 'critica': case 'absoluta': return 'danger';
    default: return 'info';
  }
}

export function citaEstadoToStatus(estadoId: number): 'success' | 'warning' | 'danger' | 'info' {
  switch (estadoId) {
    case 1: return 'warning';
    case 2: return 'success';
    case 3: return 'danger';
    default: return 'info';
  }
}
