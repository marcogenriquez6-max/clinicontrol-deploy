const DB_DUPLICATE = /duplicate key|already exists|ya existe|uniqu/i;
const DB_FK = /foreign key constraint/i;
const DB_CHECK = /check constraint/i;

const STATUS_FALLBACK: Record<number, string> = {
  400: 'Los datos enviados no son válidos. Revise los campos e intente nuevamente.',
  401: 'Su sesión expiró o las credenciales no son válidas. Inicie sesión nuevamente.',
  403: 'No tiene permisos para realizar esta acción.',
  404: 'El registro solicitado no existe o fue eliminado.',
  409: 'Ya existe un registro con los mismos datos.',
  422: 'Los datos enviados no son válidos. Revise los campos e intente nuevamente.',
  500: 'Error interno del servidor. Intente nuevamente; si el problema persiste, contacte al administrador del sistema.',
};

/** Traduce errores del backend y de red a mensajes legibles para el usuario. */
export function errMsg(e: unknown, fallback = 'No se pudo completar la acción. Intente nuevamente.'): string {
  const err = e as {
    response?: { status?: number; data?: { message?: string | string[]; error?: string } };
    message?: string;
    code?: string;
  };
  const status = err?.response?.status;
  const raw = err?.response?.data?.message;
  const first = Array.isArray(raw) ? raw[0] : raw;
  const text = (first ?? '').toString().trim();

  // Errores de red: servidor inalcanzable o petición interrumpida
  const msg = err?.message ?? '';
  if (!status && (err?.code === 'ECONNABORTED' || /network error|failed to fetch|timeout/i.test(msg))) {
    return 'No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.';
  }

  if (status) {
    if (DB_DUPLICATE.test(text)) return STATUS_FALLBACK[409];
    if (DB_FK.test(text)) return 'No se puede completar la acción: el registro está siendo utilizado por otros datos.';
    if (DB_CHECK.test(text)) return 'Se detectó un valor no permitido. Revise los datos e intente nuevamente.';
    // Se conservan mensajes del backend cuando son cortos y legibles
    if (text && text.length <= 160 && !text.includes('\n')) return text;
    return STATUS_FALLBACK[status] ?? (text || fallback);
  }

  return text || msg || fallback;
}