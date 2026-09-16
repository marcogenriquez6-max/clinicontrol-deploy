import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { navGroups } from '../../data/navigation';

const MAX_ITEMS = 4;
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
  const [openMore, setOpenMore] = useState(false);

  const canAccess = (roles?: string[]) => !roles?.length || roles.includes(user?.rol || '');

  const items = navGroups
    .filter(g => canAccess(g.roles))
    .map(g => ({ ...g, items: g.items.filter(i => canAccess(i.roles)) }))
    .filter(g => g.items.length > 0);

  const visibleItems = items.slice(0, MAX_ITEMS);
  const overflowItems = items.slice(MAX_ITEMS);

  const allReachablePaths = (g: typeof items[number]) =>
    g.items.length === 1 ? [g.items[0].path] : [g.items[0].path];

  const goTo = (g: typeof items[number]) => {
    setOpenMore(false);
    // Primera sección como destino; el sheet expandido ofrece las demás
    navigate(allReachablePaths(g)[0]);
  };

  const navigateItem = (path: string) => {
    setOpenMore(false);
    navigate(path);
  };

  return (
    <>
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
          {visibleItems.map((g) => {
            const Icon = g.icon;
            const active = g.items.some(i => location.pathname === i.path);
            return (
              <button
                key={g.section}
                onClick={() => goTo(g)}
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
          {overflowItems.length > 0 && (
            <button
              onClick={() => setOpenMore(true)}
              className="flex-1 flex flex-col items-center gap-1 py-2 transition-colors"
              style={{ color: 'var(--text-tertiary)', backgroundColor: 'transparent' }}
              aria-label="Más opciones"
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-xs font-medium leading-none">Más</span>
            </button>
          )}
        </div>
      </nav>

      {/* Sheet "Más opciones" */}
      {openMore && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Más opciones de menú">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpenMore(false)} />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl shadow-2xl border-t"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-primary)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Más opciones</p>
              <button onClick={() => setOpenMore(false)} className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 space-y-3">
              {overflowItems.map((g) => {
                const Icon = g.icon;
                return (
                  <div key={g.section}>
                    <p
                      className="flex items-center gap-2 px-2 pb-1 pt-2 text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <Icon className="w-3.5 h-3.5" /> {g.section}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {g.items.map((item) => {
                        const ItemIcon = item.icon;
                        const itemActive = location.pathname === item.path;
                        return (
                          <button
                            key={item.path}
                            onClick={() => navigateItem(item.path)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all"
                            style={{
                              color: itemActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                              backgroundColor: itemActive ? 'var(--primary-50)' : 'var(--bg-secondary)',
                              borderColor: itemActive ? 'var(--primary-300)' : 'var(--border-primary)',
                            }}
                            aria-current={itemActive ? 'page' : undefined}
                          >
                            <ItemIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}