import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { useAuthStore } from '../store/authStore';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const PacientesPage = lazy(() => import('../pages/PacientesPage'));
const CitasPage = lazy(() => import('../pages/CitasPage'));
const TurnosPage = lazy(() => import('../pages/TurnosPage'));
const AgendaPage = lazy(() => import('../pages/AgendaPage'));
const CajaPage = lazy(() => import('../pages/CajaPage'));
const AlergiasPage = lazy(() => import('../pages/AlergiasPage'));
const VacunasPage = lazy(() => import('../pages/VacunasPage'));
const MedicosPage = lazy(() => import('../pages/MedicosPage'));
const ArqueoPage = lazy(() => import('../pages/ArqueoPage'));
const SucursalAdminPage = lazy(() => import('../pages/SucursalAdminPage'));
const MfaSetupPage = lazy(() => import('../pages/MfaSetupPage'));
const TurnosSalaPage = lazy(() => import('../pages/TurnosSalaPage'));
const TurnosTVPage = lazy(() => import('../pages/TurnosTVPage'));
const ConsultasPage = lazy(() => import('../pages/ConsultasPage'));
const RecetasPage = lazy(() => import('../pages/RecetasPage'));
const HistoriaClinicaPage = lazy(() => import('../pages/HistoriaClinicaPage'));
const ConsultaCompletaPage = lazy(() => import('../pages/ConsultaCompletaPage'));
const UsuariosPage = lazy(() => import('../pages/UsuariosPage'));
const ChangePasswordPage = lazy(() => import('../pages/ChangePasswordPage'));
const RolesPage = lazy(() => import('../pages/RolesPage'));
const AuditLogPage = lazy(() => import('../pages/AuditLogPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const TriajePage = lazy(() => import('../pages/TriajePage'));
const HospitalizacionPage = lazy(() => import('../pages/HospitalizacionPage'));
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
  if (roles && !roles.includes(user?.rol || '')) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

const TODOS = ['admin', 'gerente', 'secretaria', 'medico', 'recepcionista', 'enfermeria'];
const ADMISION = ['admin', 'recepcionista', 'secretaria'];
const CLINICO = ['admin', 'medico', 'enfermeria'];
const MEDICO = ['admin', 'medico'];
const STAFF_PAC = ['admin', 'recepcionista', 'secretaria', 'medico', 'enfermeria'];
const GERENCIA = ['admin', 'gerente'];

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
          <Route path="/" element={<RoleRoute roles={TODOS}><Layout><DashboardPage /></Layout></RoleRoute>} />
          <Route path="/dashboard" element={<RoleRoute roles={TODOS}><Layout><DashboardPage /></Layout></RoleRoute>} />
          <Route path="/pacientes" element={<RoleRoute roles={STAFF_PAC}><Layout><PacientesPage /></Layout></RoleRoute>} />
          <Route path="/citas" element={<RoleRoute roles={ADMISION}><Layout><CitasPage /></Layout></RoleRoute>} />
          <Route path="/turnos" element={<RoleRoute roles={ADMISION}><Layout><TurnosPage /></Layout></RoleRoute>} />
          <Route path="/agenda" element={<RoleRoute roles={[...ADMISION, 'medico']}><Layout><AgendaPage /></Layout></RoleRoute>} />
          <Route path="/caja" element={<RoleRoute roles={ADMISION}><Layout><CajaPage /></Layout></RoleRoute>} />
          <Route path="/alergias" element={<RoleRoute roles={CLINICO}><Layout><AlergiasPage /></Layout></RoleRoute>} />
          <Route path="/vacunas" element={<RoleRoute roles={CLINICO}><Layout><VacunasPage /></Layout></RoleRoute>} />
          <Route path="/medicos" element={<RoleRoute roles={['admin']}><Layout><MedicosPage /></Layout></RoleRoute>} />
          <Route path="/admin/arqueo" element={<RoleRoute roles={GERENCIA}><Layout><ArqueoPage /></Layout></RoleRoute>} />
          <Route path="/admin/sucursales" element={<RoleRoute roles={GERENCIA}><Layout><SucursalAdminPage /></Layout></RoleRoute>} />
          <Route path="/perfil/mfa" element={<RoleRoute roles={TODOS}><Layout><MfaSetupPage /></Layout></RoleRoute>} />
          {/* Pantallas kiosk sin Layout (sala de espera / TV) */}
          <Route path="/sala-espera" element={<RoleRoute roles={TODOS}><TurnosSalaPage /></RoleRoute>} />
          <Route path="/pantalla-turnos" element={<RoleRoute roles={TODOS}><TurnosTVPage /></RoleRoute>} />
          <Route path="/consultas" element={<RoleRoute roles={CLINICO}><Layout><ConsultasPage /></Layout></RoleRoute>} />
          <Route path="/triaje" element={<RoleRoute roles={CLINICO}><Layout><TriajePage /></Layout></RoleRoute>} />
          <Route path="/hospitalizacion" element={<RoleRoute roles={CLINICO}><Layout><HospitalizacionPage /></Layout></RoleRoute>} />
          <Route path="/recetas" element={<RoleRoute roles={MEDICO}><Layout><RecetasPage /></Layout></RoleRoute>} />
          <Route path="/historia-clinica" element={<RoleRoute roles={CLINICO}><Layout><HistoriaClinicaPage /></Layout></RoleRoute>} />
          <Route path="/consulta-completa" element={<RoleRoute roles={MEDICO}><Layout><ConsultaCompletaPage /></Layout></RoleRoute>} />
          <Route path="/admin/usuarios" element={<RoleRoute roles={['admin']}><Layout><UsuariosPage /></Layout></RoleRoute>} />
          <Route path="/admin/roles" element={<RoleRoute roles={['admin']}><Layout><RolesPage /></Layout></RoleRoute>} />
          <Route path="/admin/audit" element={<RoleRoute roles={GERENCIA}><Layout><AuditLogPage /></Layout></RoleRoute>} />
          <Route path="/perfil" element={<RoleRoute roles={TODOS}><Layout><ProfilePage /></Layout></RoleRoute>} />
          <Route path="/perfil/cambiar-password" element={<RoleRoute roles={TODOS}><Layout><ChangePasswordPage /></Layout></RoleRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
