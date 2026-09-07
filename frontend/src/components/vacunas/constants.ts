import { CheckCircle, Clock, Calendar, AlertCircle, type LucideIcon } from 'lucide-react';

export const estadoBadge = (estado: string): string => {
  const map: Record<string, string> = {
    completa: 'bg-[var(--success-100)] text-[var(--success-700)]',
    incompleta: 'bg-[var(--warning-100)] text-[var(--warning-700)]',
    pendiente: 'bg-[var(--info-100)] text-[var(--info-500)]',
    atrasada: 'bg-[var(--danger-100)] text-[var(--danger-700)]',
    no_corresponde: 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]',
  };
  return map[estado] || 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]';
};

export const estadoIcon = (estado: string): LucideIcon => {
  const map: Record<string, LucideIcon> = {
    completa: CheckCircle,
    incompleta: Clock,
    pendiente: Calendar,
    atrasada: AlertCircle,
    no_corresponde: Clock,
  };
  return map[estado] || Clock;
};
