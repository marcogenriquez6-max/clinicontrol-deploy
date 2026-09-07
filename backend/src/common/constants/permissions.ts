/**
 * Mapa centralizado de permisos por rol.
 * Usado por AuthDomainService y JwtTokenAdapter.
 * SIEMPRE editar aquí para mantener consistencia.
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['*'],
  gerente: [
    'indicadores:read',
    'estadisticas:read',
    'reportes:read',
    'audit:read',
  ],
  secretaria: [
    'pacientes:read',
    'pacientes:write',
    'citas:read',
    'citas:write',
    'turnos:read',
    'turnos:write',
    'pagos:read',
    'pagos:write',
    'reportes_recepcion:read',
  ],
  medico: [
    'agenda_dia:read',
    'pacientes:read',
    'historial:read',
    'consultas:read',
    'consultas:write',
    'diagnosticos:write',
    'cie10:read',
    'recetas:write',
    'hospitalizacion:read',
    'hospitalizacion:write',
    'notas_evolucion:write',
    'reportes_medicos:read',
  ],
  enfermeria: [
    'pacientes:read',
    'turnos:read',
    'signos_vitales:write',
    'triaje:write',
    'hospitalizacion:read',
    'hospitalizacion:write',
    'reportes_triaje:read',
  ],
  recepcionista: [
    'pacientes:read',
    'pacientes:write',
    'citas:read',
    'citas:write',
    'turnos:read',
    'turnos:write',
    'pagos:read',
    'pagos:write',
    'reportes_recepcion:read',
  ],
  paciente: ['mis_citas:read', 'mis_recetas:read', 'mi_historial:read'],
};

export function getPermissionsForRole(rol?: string): string[] {
  return ROLE_PERMISSIONS[rol || 'usuario'] || [];
}
