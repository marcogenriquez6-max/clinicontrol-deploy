import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  Ticket,
  Banknote,
  ReceiptText,
  ClipboardList,
  Pill,
  FileText,
  Building2,
  UserCog,
  Shield,
  ClipboardCheck,
  BedDouble,
  HeartPulse,
  Activity,
  Thermometer,
  Hourglass,
  BookOpen,
  CalendarCheck,
  LogOut,
  NotebookPen,
  BarChart3,
  TrendingUp,
  KeyRound,
  Settings,
  DatabaseBackup,
  Monitor,
  Tv,
  UserCircle,
  LockKeyhole,
  type LucideIcon,
} from 'lucide-react';

export type NavGroup = {
  section: string;
  icon: LucideIcon;
  roles?: string[];
  items: {
    label: string;
    path: string;
    icon: LucideIcon;
    roles?: string[];
  }[];
};

// Conjuntos de roles — deben coincidir con AppRoutes.tsx.
// Cada rol ve un único menú, tal como lo describe el documento de grado.
// El administrador configura el sistema pero NO participa del acto asistencial.
export const TODOS = ['admin', 'gerente', 'secretaria', 'medico', 'recepcionista', 'enfermeria'];
export const RECEPCION = ['recepcionista', 'secretaria'];
export const ENFERMERIA = ['enfermeria'];
export const MEDICO = ['medico'];
export const HOSPITALIZACION = ['medico', 'enfermeria'];
export const GERENCIA = ['gerente'];
export const ADMIN = ['admin'];

/** Pantalla de inicio de cada rol. */
export const HOME_POR_ROL: Record<string, string> = {
  recepcionista: '/dashboard',
  secretaria: '/dashboard',
  enfermeria: '/enfermeria/espera',
  medico: '/medico/agenda',
  gerente: '/gerencia/dashboard',
  admin: '/admin/usuarios',
};

export const navGroups: NavGroup[] = [
  {
    section: 'Recepción',
    icon: Users,
    roles: RECEPCION,
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Pacientes', path: '/pacientes', icon: Users },
      { label: 'Citas', path: '/citas', icon: Calendar },
      { label: 'Turnos', path: '/turnos', icon: Ticket },
      { label: 'Pagos', path: '/pagos', icon: Banknote },
      { label: 'Recibos', path: '/recibos', icon: ReceiptText },
      { label: 'Reportes de Recepción', path: '/recepcion/reportes', icon: ClipboardList },
    ],
  },
  {
    section: 'Enfermería',
    icon: HeartPulse,
    roles: ENFERMERIA,
    items: [
      { label: 'Pacientes en Espera', path: '/enfermeria/espera', icon: Hourglass },
      { label: 'Triaje', path: '/triaje', icon: Activity },
      { label: 'Signos Vitales', path: '/enfermeria/signos-vitales', icon: Thermometer },
      { label: 'Reportes', path: '/enfermeria/reportes', icon: ClipboardList },
    ],
  },
  {
    section: 'Consulta Médica',
    icon: Stethoscope,
    roles: MEDICO,
    items: [
      { label: 'Agenda del Día', path: '/medico/agenda', icon: CalendarCheck },
      { label: 'Pacientes', path: '/pacientes', icon: Users },
      { label: 'Historia Clínica', path: '/historia-clinica', icon: FileText },
      { label: 'CIE-10', path: '/medico/cie10', icon: BookOpen },
      { label: 'Recetas', path: '/recetas', icon: Pill },
      { label: 'Hospitalización', path: '/hospitalizacion/camas', icon: BedDouble },
      { label: 'Reportes Médicos', path: '/medico/reportes', icon: ClipboardList },
    ],
  },
  {
    section: 'Hospitalización',
    icon: BedDouble,
    roles: HOSPITALIZACION,
    items: [
      { label: 'Camas', path: '/hospitalizacion/camas', icon: BedDouble },
      { label: 'Internaciones', path: '/hospitalizacion/internaciones', icon: ClipboardList },
      { label: 'Evoluciones', path: '/hospitalizacion/evoluciones', icon: NotebookPen },
      { label: 'Altas', path: '/hospitalizacion/altas', icon: LogOut },
      { label: 'Reportes', path: '/hospitalizacion/reportes', icon: FileText },
    ],
  },
  {
    section: 'Gerencia',
    icon: BarChart3,
    roles: GERENCIA,
    items: [
      { label: 'Dashboard', path: '/gerencia/dashboard', icon: LayoutDashboard },
      { label: 'Indicadores', path: '/gerencia/indicadores', icon: TrendingUp },
      { label: 'Estadísticas', path: '/gerencia/estadisticas', icon: BarChart3 },
      { label: 'Reportes', path: '/gerencia/reportes', icon: ClipboardList },
    ],
  },
  {
    section: 'Administración',
    icon: Building2,
    roles: ADMIN,
    items: [
      { label: 'Usuarios', path: '/admin/usuarios', icon: UserCog },
      { label: 'Roles', path: '/admin/roles', icon: Shield },
      { label: 'Permisos', path: '/admin/permisos', icon: KeyRound },
      { label: 'Auditoría', path: '/admin/audit', icon: ClipboardCheck },
      { label: 'Configuración', path: '/admin/configuracion', icon: Settings },
      { label: 'Respaldos', path: '/admin/respaldos', icon: DatabaseBackup },
    ],
  },
  {
    section: 'Mi Cuenta',
    icon: UserCircle,
    roles: TODOS,
    items: [
      { label: 'Perfil', path: '/perfil', icon: UserCircle },
      { label: 'Cambiar Contraseña', path: '/perfil/cambiar-password', icon: LockKeyhole },
    ],
  },
];

/** Pantallas kiosk enrutadas sin layout (acceso directo desde sala/TV) */
export const KIOSK_ROUTES = [
  { label: 'Sala de Espera', path: '/sala-espera', icon: Monitor },
  { label: 'Pantalla de Turnos', path: '/pantalla-turnos', icon: Tv },
];
