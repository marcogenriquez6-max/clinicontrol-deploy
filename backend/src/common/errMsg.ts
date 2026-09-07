// Error messages used across the application
// Following rule F4: messages come from backend, never invented in frontend

export const ERR = {
  // Auth
  AUTH_INVALID_CREDENTIALS: 'Credenciales inválidas',
  AUTH_USER_BLOCKED: 'Cuenta bloqueada',
  AUTH_REFRESH_INVALID: 'Refresh token inválido o expirado',
  AUTH_REFRESH_REUSED: 'Refresh token ya utilizado',
  AUTH_EMAIL_EXISTS: 'El email ya está registrado',
  AUTH_CI_EXISTS: 'La cédula ya está registrada',
  AUTH_EMAIL_REQUIRED: 'El email es obligatorio',
  AUTH_PASSWORD_REQUIRED: 'La contraseña es obligatoria',
  AUTH_PASSWORD_MIN: 'Mínimo 6 caracteres',

  // Paciente
  PACIENTE_CI_UNICA:
    'Ya existe un paciente registrado con la cédula {ci}. Búsquelo en el padrón.',
  PACIENTE_CI_INVALIDA: 'La cédula debe tener entre 5 y 15 dígitos',
  PACIENTE_CI_OBLIGATORIO: 'La cédula de identidad es obligatoria',
  PACIENTE_NOMBRE_REQUIERDO: 'El nombre es obligatorio',
  PACIENTE_APELLIDO_REQUIERDO: 'El apellido es obligatorio',
  PACIENTE_FECHA_NACIMIENTO_REQUIERDA: 'La fecha de nacimiento es obligatoria',
  PACIENTE_NO_ENCONTRADO: 'Paciente no encontrado',
  PACIENTE_CI_EXISTE: 'CI ya existe en el sistema',

  // Cita
  CITA_HORARIO_LIBRE: 'Horario disponible',
  CITA_HORARIO_OCUPADO:
    'El Dr. {doctor} ya tiene una cita de {horaInicio} a {horaFin}. Elija otro horario.',
  CITA_NO_ENCONTRADA: 'Cita no encontrada',
  CITA_SIN_TURNO: 'Esta cita ya tiene un turno emitido',
  CITA_SOLAPAMIENTO: 'Conflicto de horario',
  CITA_CANCELADA: 'Cita cancelada',

  // Turno
  TURNO_NO_ENCONTRADO: 'Turno no encontrado',
  TURNO_YA_PAGADO: 'El turno ya está pagado',
  TURNO_CREADO: 'Turno # {numero} emitido',

  // Caja
  CAJA_SESION_ABIERTA: 'Ya hay una sesión de caja abierta',
  CAJA_SESION_CERRADA: 'La sesión ya está cerrada',
  CAJA_NO_HAY_SESION: 'No hay una sesión de caja abierta',
  CAJA_MONTO_MENOR: 'El monto recibido es menor al fondo inicial',
  CAJA_NO_CERRAR_PENDIENTES:
    'No se puede cerrar: existen cobros pendientes de registrar',
  CAJA_ARQUEO_SIN_SESION_CERRADA: 'No hay una sesión cerrada para hacerarqueo',

  // General
  DATO_INVALIDO: 'Dato inválido',
  ACCION_EXITOSA: 'Operación completada exitosamente',
  ERROR_SISTEMA: 'Error del sistema, intente más tarde',
};

// Helper for paciente CI message
export const pacienteCiMessage = (ci: string) =>
  ERR.PACIENTE_CI_UNICA.replace('{ci}', ci);
