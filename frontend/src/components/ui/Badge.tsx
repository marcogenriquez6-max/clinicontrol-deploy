import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  className?: string;
  dot?: boolean;
  size?: 'sm' | 'md';
}

export default function Badge({ children, variant = 'neutral', className = '', dot = false, size = 'sm' }: BadgeProps) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-150';
  const sizes = { sm: 'px-2.5 py-0.5 text-xs', md: 'px-3 py-1 text-sm' };

  const variants: Record<string, string> = {
    primary: 'bg-[var(--primary-100)] text-[var(--primary-700)] border border-[var(--primary-200)]',
    success: 'bg-[var(--success-100)] text-[var(--success-700)] border border-[var(--success-200)]',
    danger: 'bg-[var(--danger-100)] text-[var(--danger-700)] border border-[var(--danger-200)]',
    warning: 'bg-[var(--warning-100)] text-[var(--warning-700)] border border-[var(--warning-200)]',
    info: 'bg-[var(--info-100)] text-[var(--info-700)] border border-[var(--info-200)]',
    neutral: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)]',
  };

  const dots: Record<string, string> = {
    primary: 'bg-[var(--primary-500)]',
    success: 'bg-[var(--success-500)]',
    danger: 'bg-[var(--danger-500)]',
    warning: 'bg-[var(--warning-500)]',
    info: 'bg-[var(--info-500)]',
    neutral: 'bg-[var(--neutral-400)]',
  };

  return (
    <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} />}
      {children}
    </span>
  );
}