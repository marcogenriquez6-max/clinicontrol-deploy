import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown, ChevronLeft, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { navGroups, type NavGroup } from '../../data/navigation';
import Logo from '../ui/Logo';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const open = !collapsed;
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    navGroups.forEach(g => {
      const groupActive = g.items.some(i => location.pathname === i.path);
      if (groupActive) init[g.section] = true;
    });
    return init;
  });

  const canAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(user?.rol || '');
  };

  const toggleSection = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const visibleGroups = navGroups
    .filter(g => canAccess(g.roles))
    .map(g => ({ ...g, items: g.items.filter(i => canAccess(i.roles)) }))
    .filter(g => g.items.length > 0);

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (group: NavGroup) => group.items.some(i => location.pathname === i.path);

  return (
    <>
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col border-r transition-[width] duration-300"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-primary)',
          width: open ? '16rem' : '4.5rem',
        }}
      >
        {/* Logo + toggle */}
        <div className="h-14 flex items-center justify-between px-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-secondary)' }}>
          {open ? (
            <div className="flex items-center gap-2.5">
              <Logo showText={false} size="sm" />
              <div>
                <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>Clínica</p>
                <p className="text-xs leading-tight" style={{ color: 'var(--text-tertiary)' }}>Santa Isabel</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              <Logo showText={false} size="sm" />
            </div>
          )}
          <button
            onClick={onToggleCollapsed}
            className="p-1 rounded-md hidden lg:flex transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${open ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 space-y-1 ${open ? 'px-3' : 'px-2'}`}>
          {visibleGroups.map(group => {
            const Icon = group.icon;
            const groupActive = isGroupActive(group);
            const isOpen = expanded[group.section] ?? groupActive;

            if (!open) {
              return (
                <div key={group.section} className="relative">
                  {group.items.length === 1 ? (
                    <button
                      onClick={() => navigate(group.items[0].path)}
                      className="w-full flex items-center justify-center p-2 rounded-lg transition-colors"
                      style={{
                        color: isActive(group.items[0].path) ? 'var(--primary-500)' : 'var(--text-tertiary)',
                        backgroundColor: isActive(group.items[0].path) ? 'var(--primary-100)' : 'transparent',
                      }}
                      title={group.items[0].label}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setExpanded(prev => ({ ...prev, [group.section]: !prev[group.section] }))}
                      className="w-full flex items-center justify-center p-2 rounded-lg transition-colors"
                      style={{
                        color: groupActive ? 'var(--primary-500)' : 'var(--text-tertiary)',
                        backgroundColor: groupActive ? 'var(--primary-100)' : 'transparent',
                      }}
                      title={group.section}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div key={group.section}>
                <button
                  onClick={() => toggleSection(group.section)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: groupActive ? 'var(--primary-500)' : 'var(--text-secondary)',
                    backgroundColor: groupActive ? 'var(--primary-100)' : 'transparent',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{group.section}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-tertiary)' }} />
                </button>
                {isOpen && (
                  <div className="mt-0.5 ml-2 space-y-0.5">
                    {group.items.map(item => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                          style={{
                            color: active ? 'var(--primary-500)' : 'var(--text-secondary)',
                            backgroundColor: active ? 'var(--primary-100)' : 'transparent',
                            fontWeight: active ? 500 : undefined,
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: active ? 'var(--primary-500)' : 'transparent' }}
                          />
                          <ItemIcon className="w-4 h-4" style={{ color: active ? 'var(--primary-500)' : 'var(--text-tertiary)' }} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="flex-shrink-0 border-t p-3" style={{ borderColor: 'var(--border-secondary)' }}>
          <div className={`flex items-center ${open ? 'gap-3 px-3 py-2' : 'justify-center py-1'}`}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
              style={{ backgroundColor: 'var(--primary-500)', color: '#fff' }}
            >
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            {open && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.nombre || 'Usuario'}</p>
                  <p className="text-xs truncate capitalize" style={{ color: 'var(--text-tertiary)' }}>{user?.rol || ''}</p>
                </div>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
