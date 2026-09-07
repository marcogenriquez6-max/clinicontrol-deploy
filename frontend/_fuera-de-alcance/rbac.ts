/**
 * Matriz RBAC — Clínica Santa Isabel
 * Alineada a la tesis: HU-01..HU-08, RF-11 y matriz de consistencia.
 * Claves en minúscula = user.rol del backend.
 */

export interface RolInfo {
  key: string;
  nombre: string;
  descripcion: string;
  color: string;
  /** Historias de usuario / requerimientos que cubre */
  hu: string[];
  /** Capacidades clave del perfil */
  capacidades: string[];
  /** Módulos visibles en el menú */
  modulos: string[];
}

export const ROLES_MATRIZ: Record<string, RolInfo> = {
  admin: {
    key: 'admin',
    nombre: 'Administrador',
    descripcion: 'Control total del sistema: seguridad, usuarios, catálogos y soporte.',
    color: '#334155',
    hu: ['HU-01'],
    capacidades: [
      'Autenticación y control de acceso (JWT + MFA)',
      'Gestión de usuarios y asignación de los seis roles',
      'Catálogo de médicos y especialidades',
      'Sucursales, auditoría inmutable y arqueo de caja',
    ],
    modulos: ['Dashboard', 'Pacientes', 'Citas', 'Turnos', 'Agenda', 'Caja', 'Consultas', 'Historia Clínica', 'Triaje', 'Hospitalización', 'Usuarios', 'Médicos', 'Roles', 'Sucursales', 'Auditoría', 'Arqueo'],
  },
  gerente: {
    key: 'gerente',
    nombre: 'Gerente',
    descripcion: 'Supervisión operativa y financiera sin acceso a edición clínica.',
    color: '#475569',
    hu: ['EP-08 Soporte'],
    capacidades: [
      'Panel de indicadores operativos',
      'Consulta del registro de auditoría inmutable',
      'Arqueo y consolidación de caja por sucursal',
      'Administración de sucursales',
    ],
    modulos: ['Dashboard', 'Sucursales', 'Auditoría', 'Arqueo'],
  },
  secretaria: {
    key: 'secretaria',
    nombre: 'Secretaria',
    descripcion: 'Apoyo administrativo de admisión y coordinación de agendas.',
    color: '#6366f1',
    hu: ['HU-02', 'HU-03', 'HU-04'],
    capacidades: [
      'Registro único de pacientes con CI validada (anti-duplicidad)',
      'Búsqueda ágil del paciente recurrente',
      'Agendamiento de citas con validación de disponibilidad',
      'Emisión de turnos y apoyo en caja',
    ],
    modulos: ['Dashboard', 'Pacientes', 'Citas', 'Turnos', 'Agenda', 'Caja'],
  },
  medico: {
    key: 'medico',
    nombre: 'Médico',
    descripcion: 'Atención clínica con historia clínica electrónica y seguridad farmacológica.',
    color: '#0e7490',
    hu: ['HU-05', 'HU-06', 'HU-08', 'RF-11'],
    capacidades: [
      'Agenda del día como cola de atención',
      'Consulta bajo formato SOAP con diagnóstico CIE-10',
      'Prescripción con alertas de alergias e interacciones (RF-11)',
      'Hospitalización: admisión, camas y alta',
      'Acceso a la historia clínica longitudinal',
    ],
    modulos: ['Dashboard', 'Pacientes', 'Agenda', 'Consulta Completa', 'Consultas', 'Historia Clínica', 'Recetas', 'Alergias', 'Triaje', 'Hospitalización'],
  },
  enfermeria: {
    key: 'enfermeria',
    nombre: 'Enfermería',
    descripcion: 'Triaje por severidad ESI y cuidados de admisión clínica.',
    color: '#0f766e',
    hu: ['HU-07'],
    capacidades: [
      'Clasificación ESI (E1–E5) con signos vitales',
      'Cola de urgencias priorizada por severidad',
      'Registro de alergias y esquema de vacunas',
      'Apoyo en control de camas de hospitalización',
    ],
    modulos: ['Dashboard', 'Pacientes', 'Triaje', 'Alergias', 'Vacunas', 'Hospitalización'],
  },
  recepcionista: {
    key: 'recepcionista',
    nombre: 'Recepcionista',
    descripcion: 'Admisión presencial: registro único, citas y turnos.',
    color: '#0369a1',
    hu: ['HU-02', 'HU-03', 'HU-04'],
    capacidades: [
      'Registro único de pacientes con CI validada (anti-duplicidad)',
      'Recuperación del historial del paciente recurrente',
      'Agendamiento de citas con validación de horario',
      'Emisión de turnos, tickets y cobro en caja',
    ],
    modulos: ['Dashboard', 'Pacientes', 'Citas', 'Turnos', 'Agenda', 'Caja'],
  },
};

export const ROLES_KEYS = Object.keys(ROLES_MATRIZ);
