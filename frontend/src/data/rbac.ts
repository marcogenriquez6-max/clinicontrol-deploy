/**
 * Matriz RBAC — Clínica Santa Isabel
 * Alineada al documento de grado: cada rol ve un único menú y ejecuta solo
 * las operaciones de su etapa en el flujo del paciente.
 * Claves en minúscula = user.rol del backend. Debe coincidir con
 * navigation.ts (menú) y backend/common/constants/modulos-rol.ts (Permisos).
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

const RECEPCION_MODULOS = ['Dashboard', 'Pacientes', 'Citas', 'Turnos', 'Pagos', 'Recibos', 'Reportes de Recepción'];
const RECEPCION_CAPACIDADES = [
  'Registro único de pacientes con CI validada (anti-duplicidad): "Paciente encontrado" abre el expediente existente',
  'Búsqueda por CI, nombre o apellido y consulta del expediente, historial, hospitalizaciones y citas',
  'Gestión de citas: nueva, modificar, cancelar y reagendar con validación de disponibilidad',
  'Generación de turnos (A001, A002, ...) con estados Esperando → En atención → Finalizado',
  'Registro simple de pago en efectivo asociado a la atención e impresión del recibo',
  'Reporte de recepción: pacientes registrados, citas, turnos y pagos',
];

export const ROLES_MATRIZ: Record<string, RolInfo> = {
  admin: {
    key: 'admin',
    nombre: 'Administrador',
    descripcion: 'Configura el sistema. No participa del acto asistencial: no registra pacientes, no atiende consultas ni modifica historias clínicas.',
    color: '#334155',
    hu: ['HU-01', 'RNF Seguridad'],
    capacidades: [
      'Usuarios: crear, editar y desactivar',
      'Roles y matriz de permisos (RBAC aplicado en el backend)',
      'Auditoría inmutable: fecha, usuario, acción y módulo; reportes de auditoría general, actividades por usuario y accesos',
      'Configuración institucional y catálogos: médicos, camas, servicios y tarifas',
      'Respaldos de la base de datos',
    ],
    modulos: ['Usuarios', 'Roles', 'Permisos', 'Auditoría', 'Configuración', 'Respaldos'],
  },
  gerente: {
    key: 'gerente',
    nombre: 'Gerente',
    descripcion: 'Supervisión de la operación. Acceso de solo lectura: indicadores, estadísticas y reportes impresos.',
    color: '#475569',
    hu: ['EP-08 Soporte', 'Reportes'],
    capacidades: [
      'Dashboard: pacientes del día, consultas, triajes, hospitalizados y ocupación de camas',
      'Indicadores y estadísticas del período',
      'Reportes de pacientes, citas, médicos (productividad) y hospitalización',
      'Consulta del registro de auditoría',
    ],
    modulos: ['Dashboard', 'Indicadores', 'Estadísticas', 'Reportes'],
  },
  secretaria: {
    key: 'secretaria',
    nombre: 'Secretaria',
    descripcion: 'Apoyo administrativo de admisión: mismas funciones que recepción.',
    color: '#6366f1',
    hu: ['HU-02', 'HU-03', 'HU-04'],
    capacidades: RECEPCION_CAPACIDADES,
    modulos: RECEPCION_MODULOS,
  },
  recepcionista: {
    key: 'recepcionista',
    nombre: 'Recepcionista',
    descripcion: 'Admisión presencial: registro único, citas, turnos, pagos y recibos.',
    color: '#0369a1',
    hu: ['HU-02', 'HU-03', 'HU-04'],
    capacidades: RECEPCION_CAPACIDADES,
    modulos: RECEPCION_MODULOS,
  },
  medico: {
    key: 'medico',
    nombre: 'Médico',
    descripcion: 'Atención clínica: agenda del día con pacientes pagados, SOAP, CIE-10, recetas con seguridad farmacológica y hospitalización.',
    color: '#0e7490',
    hu: ['HU-05', 'HU-06', 'HU-08', 'RF-11'],
    capacidades: [
      'Agenda del Día: solo pacientes con pago registrado (o urgencia ESI-1/2)',
      'Historia clínica longitudinal: datos, antecedentes, alergias, consultas e internaciones',
      'Registro SOAP (subjetivo, objetivo, análisis, plan) con diagnóstico CIE-10',
      'Receta médica con verificación de alergias e interacciones (alerta clínica) e impresión',
      'Hospitalización: camas, internación, evolución diaria y alta',
      'Reportes médicos: consultas, diagnósticos frecuentes y recetas',
    ],
    modulos: ['Agenda del Día', 'Pacientes', 'Historia Clínica', 'CIE-10', 'Recetas', 'Hospitalización', 'Reportes Médicos'],
  },
  enfermeria: {
    key: 'enfermeria',
    nombre: 'Enfermería',
    descripcion: 'Triaje por severidad ESI, signos vitales y apoyo en hospitalización.',
    color: '#0f766e',
    hu: ['HU-07'],
    capacidades: [
      'Pacientes en espera: turno, paciente, hora y estado',
      'Triaje: temperatura, presión arterial, peso, talla, frecuencia cardíaca y saturación',
      'Clasificación ESI-1 a ESI-5 y observaciones clínicas',
      'Hospitalización: camas, internaciones, evoluciones y altas',
      'Reporte de triaje: realizados, clasificación ESI y pacientes atendidos',
    ],
    modulos: ['Pacientes en Espera', 'Triaje', 'Signos Vitales', 'Hospitalización', 'Reportes'],
  },
};

export const ROLES_KEYS = Object.keys(ROLES_MATRIZ);
