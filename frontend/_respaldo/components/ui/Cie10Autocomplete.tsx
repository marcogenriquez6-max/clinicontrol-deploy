import { useEffect, useRef, useState } from 'react';
import { Search, Loader2, Stethoscope } from 'lucide-react';
import { diagnosticoService } from '../../api/diagnostico.service';
import type { Cie10 } from '../../types';

interface Cie10AutocompleteProps {
  value?: Cie10 | null;
  onSelect: (item: Cie10 | null) => void;
  placeholder?: string;
  error?: string;
  label?: string;
}

export default function Cie10Autocomplete({
  value,
  onSelect,
  placeholder = 'Buscar código o descripción CIE-10...',
  error,
  label,
}: Cie10AutocompleteProps) {
  const [query, setQuery] = useState(() => (value ? `${value.codigo} — ${value.descripcion}` : ''));
  const [results, setResults] = useState<Cie10[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const doSearch = (term: string) => {
    if (term.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    diagnosticoService
      .searchCie10(term.trim())
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : ((res.data as unknown as { data?: Cie10[] })?.data ?? []);
        setResults(data.slice(0, 8));
        setOpen(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  const onChange = (v: string) => {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(v), 300);
  };

  const pick = (item: Cie10) => {
    onSelect(item);
    setQuery(`${item.codigo} — ${item.descripcion}`);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg outline-none transition-colors"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: `1px solid ${error ? 'var(--danger-500)' : 'var(--border-primary)'}`,
            color: 'var(--text-primary)',
          }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-tertiary)' }} />
          ) : (
            <Stethoscope className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          )}
        </span>
      </div>
      {error && (
        <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger-600)' }}>
          {error}
        </p>
      )}
      {open && results.length > 0 && (
        <div
          className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
          role="listbox"
        >
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => pick(r)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--primary-50)]"
              role="option"
              aria-selected={false}
            >
              <span
                className="flex-shrink-0 rounded-md px-2 py-0.5 text-xs font-bold"
                style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}
              >
                {r.codigo}
              </span>
              <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {r.descripcion}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
