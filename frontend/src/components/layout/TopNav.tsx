import { useNavigate } from 'react-router-dom';
import {
  LogOut, Moon, Sun, Search, X,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { pacienteService } from '../../api/services';

interface SearchResult {
  type: 'paciente' | 'medico';
  id: number;
  label: string;
  sublabel: string;
}

interface TopNavProps {
  collapsed: boolean;
}

export default function TopNav({ collapsed }: TopNavProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doSearch = (term: string) => {
    if (term.length < 2) { setResults([]); setShowResults(false); return; }
    (async () => {
      try {
        const pRes = await pacienteService.getAll().catch(() => ({ data: [] }));
        const pArr = Array.isArray(pRes.data) ? pRes.data : [];
        const t = term.toLowerCase();
        const found: SearchResult[] = [];
        pArr.forEach((p: { id?: number; nombre?: string; apellido?: string; ci?: string }) => {
          const name = `${p.nombre ?? ''} ${p.apellido ?? ''}`.toLowerCase();
          if (name.includes(t) || (p.ci ?? '').includes(t)) {
            found.push({ type: 'paciente', id: p.id ?? 0, label: `${p.nombre ?? ''} ${p.apellido ?? ''}`, sublabel: `CI: ${p.ci ?? ''}` });
          }
        });
        setResults(found.slice(0, 8));
        setShowResults(true);
      } catch { setResults([]); }
    })();
  };

  const onSearchChange = (v: string) => {
    setSearchTerm(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(v), 300);
  };

  const handleResultClick = (r: SearchResult) => {
    setShowResults(false);
    setSearchTerm('');
    if (r.type === 'paciente') navigate(`/historia-clinica?pacienteId=${r.id}`);
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-30 border-b transition-[left] duration-300 ${collapsed ? 'lg:left-[4.5rem]' : 'lg:left-64'}`}
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-primary)',
      }}
    >
      <div className="flex items-center h-14 px-4 sm:px-6">
        {/* Search */}
        <div ref={searchContainerRef} className={`relative items-center flex-1 max-w-md ${searchOpen ? 'flex' : 'hidden md:flex'}`}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Buscar pacientes..."
              value={searchTerm}
              autoFocus={searchOpen}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => searchTerm.length >= 2 && results.length > 0 && setShowResults(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchOpen(false);
                  setSearchTerm('');
                  setShowResults(false);
                }
              }}
              className="w-full pl-9 pr-9 py-2 text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)]"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            />
            {searchOpen && (
              <button
                onClick={() => { setSearchOpen(false); setSearchTerm(''); setShowResults(false); }}
                className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
                aria-label="Cerrar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg overflow-hidden z-50"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
              {results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => handleResultClick(r)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-500)' }}>
                    {r.type === 'paciente' ? 'P' : 'M'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.sublabel}</p>
                  </div>
                  <span className="text-xs px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>
                    {r.type === 'paciente' ? 'Paciente' : 'Médico'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div className={`flex items-center gap-1 ml-auto ${searchOpen ? 'hidden md:flex' : 'flex'}`}>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-md transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 ml-1 sm:ml-2 border-l" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                style={{ backgroundColor: 'var(--primary-500)', color: '#fff' }}
              >
                {user?.nombre?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {user?.nombre || 'Usuario'}
              </span>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-2 rounded-md transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
