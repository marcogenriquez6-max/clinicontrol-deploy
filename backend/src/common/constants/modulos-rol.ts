/**
 * Módulos que cada rol ve en el sistema, según el documento de grado.
 * Se usa en la pantalla "Permisos" del administrador y debe coincidir con
 * frontend/src/data/navigation.ts.
 */
export const MODULOS_POR_ROL: Record<string, string[]> = {
  admin: ['Usuarios', 'Roles', 'Permisos', 'Auditoría', 'Configuración', 'Respaldos'],
  gerente: ['Dashboard', 'Indicadores', 'Estadísticas', 'Reportes'],
  secretaria: ['Dashboard', 'Pacientes', 'Citas', 'Turnos', 'Pagos', 'Recibos', 'Reportes de Recepción'],
  recepcionista: ['Dashboard', 'Pacientes', 'Citas', 'Turnos', 'Pagos', 'Recibos', 'Reportes de Recepción'],
  medico: [
    'Agenda del Día',
    'Pacientes',
    'Historia Clínica',
    'CIE-10',
    'Recetas',
    'Hospitalización',
    'Reportes Médicos',
  ],
  enfermeria: ['Pacientes en Espera', 'Triaje', 'Signos Vitales', 'Hospitalización', 'Reportes'],
};

export const DESCRIPCION_ROL: Record<string, string> = {
  admin: 'Configura el sistema, usuarios y respaldos. No participa del acto asistencial.',
  gerente: 'Supervisa indicadores, estadísticas y reportes. Solo lectura.',
  secretaria: 'Apoya la admisión: pacientes, citas, turnos y pagos.',
  recepcionista: 'Registra pacientes, agenda citas, genera turnos y cobra la atención.',
  medico: 'Atiende la agenda del día, registra SOAP, diagnósticos CIE-10 y recetas.',
  enfermeria: 'Realiza triaje ESI, registra signos vitales y apoya hospitalización.',
};
