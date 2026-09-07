import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { navGroups } from '../../data/navigation';

const MAX_ITEMS = 5;
const LABELS_CORTOS: Record<string, string> = {
  'Recepción': 'Recepción',
  'Enfermería': 'Enfermería',
  'Consulta Médica': 'Consulta',
  'Hospitalización': 'Hospital.',
  'Gerencia': 'Gerencia',
  'Administración': 'Admin',
  'Mi Cuenta': 'Cuenta',
};

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const canAccess = (roles?: string[]) => !roles?.length || roles.includes(user?.rol || '');

  const items = navGroups
    .filter(g => canAccess(g.roles))
    .map(g => ({ ...g, items: g.items.filter(i => canAccess(i.roles)) }))
    .filter(g => g.items.length > 0)
    .slice(0, MAX_ITEMS);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-primary)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Navegación principal"
    >
      <div className="flex">
        {items.map((g) => {
          const Icon = g.icon;
          const active = g.items.some(i => location.pathname === i.path);
          return (
            <button
              key={g.section}
              onClick={() => navigate(g.items[0].path)}
              className="flex-1 flex flex-col items-center gap-1 py-2 transition-colors"
              style={{
                color: active ? 'var(--primary-600)' : 'var(--text-tertiary)',
                backgroundColor: active ? 'var(--primary-50)' : 'transparent',
              }}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium leading-none truncate max-w-full px-1">
                {LABELS_CORTOS[g.section] ?? g.section}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
