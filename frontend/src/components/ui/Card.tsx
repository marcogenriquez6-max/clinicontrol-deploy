import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  padding?: boolean;
  hover?: boolean;
  accent?: 'primary' | 'success' | 'danger' | 'warning' | 'accent' | 'fuchsia' | 'rose';
}

export default function Card({
  children,
  className,
  title,
  subtitle,
  action,
  padding = true,
  hover = false,
  accent,
}: CardProps) {
  // Determinar clases CSS base
  let baseClass = 'bg-[var(--bg-card)] rounded-lg border border-[var(--border-primary)] shadow-sm';
  let hoverClass = 'hover:border-[var(--primary-300)] hover:shadow-md transition-all duration-200';
  let accentClass = '';

  if (accent === 'primary') accentClass = 'border-l-3 border-l-[var(--primary-600)]';
  else if (accent === 'success') accentClass = 'border-l-3 border-l-[var(--success-500)]';
  else if (accent === 'danger') accentClass = 'border-l-3 border-l-[var(--danger-500)]';
  else if (accent === 'warning') accentClass = 'border-l-3 border-l-[var(--warning-500)]';
  else if (accent === 'accent') accentClass = 'border-l-3 border-l-[var(--info-500)]';
  else if (accent === 'fuchsia') accentClass = 'border-l-3 border-l-[var(--fuchsia-500)]';
  else if (accent === 'rose') accentClass = 'border-l-3 border-l-[var(--rose-500)]';

  const fullClassName = baseClass + (hover ? hoverClass : '') + (accentClass ? ' ' + accentClass : '') + (className ? ' ' + className : '');

  return (
    <div
      className={fullClassName}
      role="region"
      aria-label={title ? title.toString() : 'Tarjeta de contenido'}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-secondary)]">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span className="sr-only">Título de la tarjeta: </span>{title}
              </h3>
            )}
            {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-0.5 truncate">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0 ml-4">{action}</div>}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>
        {children}
      </div>
    </div>
  );
}
