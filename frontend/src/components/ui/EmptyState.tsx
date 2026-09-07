import type { ElementType, ReactNode } from 'react';

interface EmptyStateProps {
  icon: ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-5 shadow-inner">
        <Icon className="w-8 h-8 text-[var(--text-tertiary)]" />
      </div>
      <p className="text-base font-semibold text-[var(--text-primary)]">{title}</p>
      {description && <p className="text-sm text-[var(--text-tertiary)] mt-1.5 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
