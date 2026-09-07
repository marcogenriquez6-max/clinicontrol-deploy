import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  color?: string;
  className?: string;
}

export default function FormSection({ title, children, color = 'indigo', className = '' }: FormSectionProps) {
  const barColors: Record<string, string> = {
    indigo: 'bg-[var(--primary-500)]',
    emerald: 'bg-[var(--success-500)]',
    violet: 'bg-violet-500',
    sky: 'bg-sky-500',
    orange: 'bg-[var(--warning-500)]',
    purple: 'bg-[var(--fuchsia-50)]0',
    red: 'bg-[var(--danger-500)]',
    blue: 'bg-[var(--primary-500)]',
  };
  return (
    <div className={className}>
      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
        <span className={`w-1 h-4 rounded-full ${barColors[color] || barColors.indigo}`} />
        {title}
      </h4>
      {children}
    </div>
  );
}
