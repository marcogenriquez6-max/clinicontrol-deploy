export function errMsg(e: unknown, fallback = 'Intente nuevamente'): string {
  const err = e as { response?: { data?: { message?: string | string[] } }; message?: string };
  const raw = err?.response?.data?.message;
  const first = Array.isArray(raw) ? raw[0] : raw;
  return first || err?.message || fallback;
}
