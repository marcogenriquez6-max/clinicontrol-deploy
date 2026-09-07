/** Normaliza respuestas: array directo, {data:[...]} o paginado {data:{data:[...]}}. */
export function lista<T>(res: unknown): T[] {
  const r = res as { data?: unknown } | unknown[];
  if (Array.isArray(r)) return r as T[];
  const d = (r as { data?: unknown })?.data;
  if (Array.isArray(d)) return d as T[];
  const dd = (d as { data?: unknown })?.data;
  if (Array.isArray(dd)) return dd as T[];
  return [];
}

/** Objeto de respuesta (desenvuelve {data:{...}}). */
export function objeto<T>(res: unknown): T {
  const r = res as { data?: unknown };
  return ((r?.data ?? r) as T);
}

/** Fecha local en formato YYYY-MM-DD (toISOString usa UTC y cambia de día a las 20:00 en Bolivia). */
export function fechaLocalIso(d: Date | string = new Date()): string {
  const x = typeof d === 'string' ? (/^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T00:00:00`) : new Date(d)) : d;
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}
export const hoyIso = () => fechaLocalIso(new Date());

export function esHoy(fecha?: string | Date | null): boolean {
  if (!fecha) return false;
  const d = new Date(fecha);
  const h = new Date();
  return d.getFullYear() === h.getFullYear() && d.getMonth() === h.getMonth() && d.getDate() === h.getDate();
}
