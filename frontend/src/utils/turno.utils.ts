/** Código visible del turno: A001, A002, ... (prefijo de la clínica + correlativo del día). */
export function numeroTurno(
  numero: number | undefined | null,
  prefijo?: string | null,
): string {
  const n = numero ?? 0;
  return `${prefijo || 'A'}${String(n).padStart(3, '0')}`;
}

/** Estados internos del turno → etiqueta que ve el usuario (según el documento de grado). */
export const ESTADO_TURNO_LABEL: Record<string, string> = {
  espera: 'Esperando',
  llamado: 'Esperando',
  atencion: 'En atención',
  completado: 'Finalizado',
  cancelado: 'Cancelado',
  no_asistio: 'No asistió',
};

export function estadoTurnoLabel(estado?: string): string {
  return ESTADO_TURNO_LABEL[estado ?? ''] ?? estado ?? '';
}

export type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export function estadoTurnoVariant(estado?: string): BadgeVariant {
  switch (estado) {
    case 'espera':
    case 'llamado':
      return 'warning';
    case 'atencion':
      return 'primary';
    case 'completado':
      return 'success';
    case 'cancelado':
    case 'no_asistio':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function horaDe(fechaIso?: string | Date | null): string {
  if (!fechaIso) return '—';
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
}
