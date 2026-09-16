import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { useAuthStore } from '../store/authStore';
import {
  TODOS, RECEPCION, ENFERMERIA, MEDICO, HOSPITALIZACION, GERENCIA, ADMIN, HOME_POR_ROL,
} from '../data/navigation';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const PacientesPage = lazy(() => import('../pages/PacientesPage'));
const CitasPage = lazy(() => import('../pages/CitasPage'));
const TurnosPage = lazy(() => import('../pages/TurnosPage'));
const AgendaPage = lazy(() => import('../pages/AgendaPage'));
const PagosPage = lazy(() => import('../pages/PagosPage'));
const RecibosPage = lazy(() => import('../pages/RecibosPage'));
const ReportesRecepcionPage = lazy(() => import('../pages/ReportesRecepcionPage'));
const PacientesEsperaPage = lazy(() => import('../pages/PacientesEsperaPage'));
const TriajePage = lazy(() => import('../pages/TriajePage'));
const SignosVitalesPage = lazy(() => import('../pages/SignosVitalesPage'));
const ReportesEnfermeriaPage = lazy(() => import('../pages/ReportesEnfermeriaPage'));
const AgendaDiaPage = lazy(() => import('../pages/AgendaDiaPage'));
const HistoriaClinicaPage = lazy(() => import('../pages/HistoriaClinicaPage'));
const Cie10Page = lazy(() => import('../pages/Cie10Page'));
const RecetasPage = lazy(() => import('../pages/RecetasPage'));
const ConsultaCompletaPage = lazy(() => import('../pages/ConsultaCompletaPage'));
const ReportesMedicosPage = lazy(() => import('../pages/ReportesMedicosPage'));
const HospitalizacionPage = lazy(() => import('../pages/HospitalizacionPage'));
const AlergiasPage = lazy(() => import('../pages/AlergiasPage'));
const VacunasPage = lazy(() => import('../pages/VacunasPage'));
const GerenciaDashboardPage = lazy(() => import('../pages/GerenciaDashboardPage'));
const IndicadoresPage = lazy(() => import('../pages/IndicadoresPage'));
const EstadisticasPage = lazy(() => import('../pages/EstadisticasPage'));
const ReportesGerenciaPage = lazy(() => import('../pages/ReportesGerenciaPage'));
const UsuariosPage = lazy(() => import('../pages/UsuariosPage'));
const RolesPage = lazy(() => import('../pages/RolesPage'));
const PermisosPage = lazy(() => import('../pages/PermisosPage'));
const AuditLogPage = lazy(() => import('../pages/AuditLogPage'));
const ConfiguracionPage = lazy(() => import('../pages/ConfiguracionPage'));
const RespaldosPage = lazy(() => import('../pages/RespaldosPage'));
const MedicosPage = lazy(() => import('../pages/MedicosPage'));
const TurnosSalaPage = lazy(() => import('../pages/TurnosSalaPage'));
const TurnosTVPage = lazy(() => import('../pages/TurnosTVPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const ChangePasswordPage = lazy(() => import('../pages/ChangePasswordPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ color: 'var(--text-tertiary)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary-500)', borderTopColor: 'transparent' }} />
        <span className="text-sm">Cargando...</span>
      </div>
    </div>
  );
}

/** Cada rol entra directamente a su pantalla principal. */
function HomeRedirect() {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  if (isInitializing) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={HOME_POR_ROL[user?.rol ?? ''] ?? '/perfil'} replace />;
}

function RoleRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
        Cargando…
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user?.rol || '')) {
    return <Navigate to={HOME_POR_ROL[user?.rol ?? ''] ?? '/perfil'} replace />;
  }
  return <>{children}</>;
}

const P = ({ roles, children }: { roles: string[]; children: React.ReactNode }) => (
  <RoleRoute roles={roles}><Layout>{children}</Layout></RoleRoute>
);

const RECEPCION_Y_MEDICO = [...RECEPCION, ...MEDICO];
const CLINICO = [...MEDICO, ...ENFERMERIA];
const TURNOS_LECTURA = [...RECEPCION, ...MEDICO, ...ENFERMERIA, ...GERENCIA];

export default function AppRoutes() {
  const initialize = useAuthStore((s) => s.initialize);
  useEffect(() => { initialize(); }, [initialize]);
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* ── RECEPCIÓN ── */}
          <Route path="/dashboard" element={<P roles={RECEPCION}><DashboardPage /></P>} />
          <Route path="/pacientes" element={<P roles={[...RECEPCION_Y_MEDICO, ...ENFERMERIA]}><PacientesPage /></P>} />
          <Route path="/citas" element={<P roles={RECEPCION}><CitasPage /></P>} />
          <Route path="/turnos" element={<P roles={RECEPCION}><TurnosPage /></P>} />
          <Route path="/pagos" element={<P roles={RECEPCION}><PagosPage /></P>} />
          <Route path="/recibos" element={<P roles={RECEPCION}><RecibosPage /></P>} />
          <Route path="/recepcion/reportes" element={<P roles={RECEPCION}><ReportesRecepcionPage /></P>} />
          <Route path="/agenda" element={<P roles={[...RECEPCION, ...ADMIN]}><AgendaPage /></P>} />

          {/* ── ENFERMERÍA ── */}
          <Route path="/enfermeria/espera" element={<P roles={ENFERMERIA}><PacientesEsperaPage /></P>} />
          <Route path="/triaje" element={<P roles={CLINICO}><TriajePage /></P>} />
          <Route path="/enfermeria/signos-vitales" element={<P roles={ENFERMERIA}><SignosVitalesPage /></P>} />
          <Route path="/enfermeria/reportes" element={<P roles={ENFERMERIA}><ReportesEnfermeriaPage /></P>} />

          {/* ── MÉDICO ── */}
          <Route path="/medico/agenda" element={<P roles={MEDICO}><AgendaDiaPage /></P>} />
          <Route path="/consultas" element={<Navigate to="/medico/agenda" replace />} />
          <Route path="/historia-clinica" element={<P roles={CLINICO}><HistoriaClinicaPage /></P>} />
          <Route path="/medico/cie10" element={<P roles={MEDICO}><Cie10Page /></P>} />
          <Route path="/recetas" element={<P roles={MEDICO}><RecetasPage /></P>} />
          <Route path="/consulta-completa" element={<P roles={MEDICO}><ConsultaCompletaPage /></P>} />
          <Route path="/medico/reportes" element={<P roles={MEDICO}><ReportesMedicosPage /></P>} />
          <Route path="/alergias" element={<P roles={CLINICO}><AlergiasPage /></P>} />
          <Route path="/vacunas" element={<P roles={CLINICO}><VacunasPage /></P>} />

          {/* ── HOSPITALIZACIÓN ── */}
          <Route path="/hospitalizacion" element={<Navigate to="/hospitalizacion/camas" replace />} />
          <Route path="/hospitalizacion/:seccion" element={<P roles={HOSPITALIZACION}><HospitalizacionPage /></P>} />

          {/* ── GERENCIA ── */}
          <Route path="/gerencia/dashboard" element={<P roles={GERENCIA}><GerenciaDashboardPage /></P>} />
          <Route path="/gerencia/indicadores" element={<P roles={GERENCIA}><IndicadoresPage /></P>} />
          <Route path="/gerencia/estadisticas" element={<P roles={GERENCIA}><EstadisticasPage /></P>} />
          <Route path="/gerencia/reportes" element={<P roles={GERENCIA}><ReportesGerenciaPage /></P>} />

          {/* ── ADMINISTRACIÓN ── */}
          <Route path="/admin/usuarios" element={<P roles={ADMIN}><UsuariosPage /></P>} />
          <Route path="/admin/roles" element={<P roles={ADMIN}><RolesPage /></P>} />
          <Route path="/admin/permisos" element={<P roles={ADMIN}><PermisosPage /></P>} />
          <Route path="/admin/audit" element={<P roles={[...ADMIN, ...GERENCIA]}><AuditLogPage /></P>} />
          <Route path="/admin/configuracion" element={<P roles={ADMIN}><ConfiguracionPage /></P>} />
          <Route path="/admin/respaldos" element={<P roles={ADMIN}><RespaldosPage /></P>} />
          <Route path="/medicos" element={<P roles={ADMIN}><MedicosPage /></P>} />

          {/* ── Pantallas kiosk sin Layout (sala de espera / TV) ── */}
          <Route path="/sala-espera" element={<RoleRoute roles={TURNOS_LECTURA}><TurnosSalaPage /></RoleRoute>} />
          <Route path="/pantalla-turnos" element={<RoleRoute roles={TURNOS_LECTURA}><TurnosTVPage /></RoleRoute>} />

          {/* ── Mi cuenta ── */}
          <Route path="/perfil" element={<P roles={TODOS}><ProfilePage /></P>} />
          <Route path="/perfil/cambiar-password" element={<P roles={TODOS}><ChangePasswordPage /></P>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
