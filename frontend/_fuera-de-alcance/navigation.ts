import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  Ticket,
  CalendarClock,
  Banknote,
  ClipboardList,
  Pill,
  FileText,
  Building2,
  UserCog,
  Shield,
  ClipboardCheck,
  BedDouble,
  HeartPulse,
  AlertTriangle,
  Syringe,
  KeyRound,
  Landmark,
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

const TODOS = ['admin', 'gerente', 'secretaria', 'medico', 'recepcionista', 'enfermeria'];
const ADMISION = ['admin', 'recepcionista', 'secretaria'];
const CLINICO = ['admin', 'medico', 'enfermeria'];
const MEDICO = ['admin', 'medico'];
const STAFF_PAC = ['admin', 'recepcionista', 'secretaria', 'medico', 'enfermeria'];
const GERENCIA = ['admin', 'gerente'];

export const navGroups: NavGroup[] = [
  {
    section: 'Principal',
    icon: LayoutDashboard,
    roles: TODOS,
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Admisión',
    icon: Users,
    roles: [...ADMISION, 'medico', 'enfermeria'],
    items: [
      { label: 'Pacientes', path: '/pacientes', icon: Users, roles: STAFF_PAC },
      { label: 'Citas', path: '/citas', icon: Calendar, roles: ADMISION },
      { label: 'Turnos', path: '/turnos', icon: Ticket, roles: ADMISION },
      { label: 'Agenda Médica', path: '/agenda', icon: CalendarClock, roles: [...ADMISION, 'medico'] },
      { label: 'Caja', path: '/caja', icon: Banknote, roles: ADMISION },
    ],
  },
  {
    section: 'Atención Clínica',
    icon: Stethoscope,
    roles: CLINICO,
    items: [
      { label: 'Consultas', path: '/consultas', icon: ClipboardList, roles: CLINICO },
      { label: 'Consulta Completa', path: '/consulta-completa', icon: FileText, roles: MEDICO },
      { label: 'Historia Clínica', path: '/historia-clinica', icon: FileText, roles: CLINICO },
      { label: 'Triaje', path: '/triaje', icon: HeartPulse, roles: CLINICO },
      { label: 'Hospitalización', path: '/hospitalizacion', icon: BedDouble, roles: CLINICO },
      { label: 'Recetas', path: '/recetas', icon: Pill, roles: MEDICO },
      { label: 'Alergias', path: '/alergias', icon: AlertTriangle, roles: CLINICO },
      { label: 'Vacunas', path: '/vacunas', icon: Syringe, roles: CLINICO },
    ],
  },
  {
    section: 'Administración',
    icon: Building2,
    roles: GERENCIA,
    items: [
      { label: 'Usuarios', path: '/admin/usuarios', icon: UserCog, roles: ['admin'] },
      { label: 'Médicos', path: '/medicos', icon: Stethoscope, roles: ['admin'] },
      { label: 'Roles', path: '/admin/roles', icon: Shield, roles: ['admin'] },
      { label: 'Sucursales', path: '/admin/sucursales', icon: Building2, roles: GERENCIA },
      { label: 'Auditoría', path: '/admin/audit', icon: ClipboardCheck, roles: GERENCIA },
      { label: 'Arqueo de Caja', path: '/admin/arqueo', icon: Landmark, roles: GERENCIA },
    ],
  },
  {
    section: 'Mi Cuenta',
    icon: UserCircle,
    roles: TODOS,
    items: [
      { label: 'Perfil', path: '/perfil', icon: UserCircle },
      { label: 'Cambiar Contraseña', path: '/perfil/cambiar-password', icon: LockKeyhole },
      { label: 'Verificación MFA', path: '/perfil/mfa', icon: KeyRound },
    ],
  },
];

/** Pantallas kiosk enrutadas sin layout (acceso directo desde sala/TV) */
export const KIOSK_ROUTES = [
  { label: 'Sala de Espera', path: '/sala-espera', icon: Monitor },
  { label: 'Pantalla de Turnos', path: '/pantalla-turnos', icon: Tv },
];
