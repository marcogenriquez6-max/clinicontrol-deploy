import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) =>
    acc != null && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined, obj);
}

export interface TableFilter<T> {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  predicate?: (item: T, value: string) => boolean;
}

export interface ServerConfig {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (p: number) => void;
}

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hideable?: boolean;
  truncate?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  pageSize?: number;
  onExportPdf?: (filtered: T[]) => void;
  onExportExcel?: (filtered: T[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  title?: string;
  subtitle?: string;
  toolbar?: ReactNode;
  filters?: TableFilter<T>[];
  server?: ServerConfig;
}

export default function DataTable<T extends object>({
  columns,
  data = [],
  keyExtractor,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  searchKeys,
  pageSize = 10,
  onExportPdf,
  onExportExcel,
  loading = false,
  emptyMessage = 'No se encontraron registros',
  className = '',
  title,
  subtitle,
  toolbar,
  filters,
  server,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [, setShowColSelector] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
        setShowColSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const visibleCols = useMemo(() => columns.filter(c => !hiddenCols.has(c.key)), [columns, hiddenCols]);

  const filtered = useMemo(() => {
    let items = Array.isArray(data) ? data : [];
    Object.entries(filterValues).forEach(([fk, fv]) => {
      if (!fv) return;
      const def = filters?.find(f => f.key === fk);
      items = items.filter(item => def?.predicate ? def.predicate(item, fv) : String((item as Record<string, unknown>)[fk]) === fv);
    });
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    const keys = searchKeys || columns.map(c => c.key);
    return items.filter(item =>
      keys.some(key => {
        const val = getPath(item, key);
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, searchKeys, columns, filterValues, filters]);

  const sorted = useMemo(() => {
    const items = Array.isArray(filtered) ? filtered : [];
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      const aVal = getPath(a, sortKey);
      const bVal = getPath(b, sortKey);
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), 'es', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const sortedArr = Array.isArray(sorted) ? sorted : [];
  const totalPages = server ? Math.max(1, server.totalPages) : Math.max(1, Math.ceil(sortedArr.length / pageSize));
  const currentPage = server ? server.page : page;
  const paginated = server ? sortedArr : sortedArr.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = useCallback((key: string) => {
    setSortKey(prev => {
      if (prev === key) {
        setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        return key;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  const toggleColumn = (key: string) => {
    setHiddenCols(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range: (number | '...')[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  };

  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
        {(title || subtitle) && (
          <div className="px-6 py-4 border-b border-[var(--border-primary)]">
            {title && <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>}
            {subtitle && <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>}
          </div>
        )}
        <div className="p-6 space-y-4">
          <div className="h-10 shimmer rounded-xl" />
          {[1,2,3,4,5].map(i => <div key={i} className="h-12 shimmer rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden ${className}`}>
      {/* Header */}
      {(title || subtitle || searchable || toolbar || onExportPdf || onExportExcel || (filters && filters.length > 0)) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[var(--border-primary)]">
          <div className="min-w-0 flex-1 basis-full sm:basis-auto">
            {title && <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>}
            {subtitle && <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {filters && filters.length > 0 && filters.map(fdef => (
              <select
                key={fdef.key}
                value={filterValues[fdef.key] ?? ''}
                onChange={e => { setFilterValues(prev => ({ ...prev, [fdef.key]: e.target.value })); setPage(1); }}
                className="h-10 px-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-primary)] focus:focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] focus:border-[var(--primary-400)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all cursor-pointer"
                aria-label={fdef.label}
              >
                <option value="">{fdef.label}: Todos</option>
                {fdef.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ))}
            {toolbar}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder={searchPlaceholder}
                  className="w-56 pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] focus:border-[var(--primary-400)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            )}
            <div className="relative" ref={exportRef}>
              <button onClick={() => { setShowExport(!showExport); setShowColSelector(false); }} className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all active:scale-90">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              {showExport && (
                <div className="absolute right-0 mt-1.5 z-20 min-w-[180px] bg-[var(--bg-card)] rounded-2xl shadow-dropdown border border-[var(--border-primary)] py-1 animate-scale">
                  <p className="px-4 py-1.5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Exportar</p>
                  {onExportPdf && (
                    <button onClick={() => { onExportPdf(filtered); setShowExport(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                      <FileText className="w-4 h-4 text-[var(--danger-500)]" />PDF
                    </button>
                  )}
                  {onExportExcel && (
                    <button onClick={() => { onExportExcel(filtered); setShowExport(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                      <FileSpreadsheet className="w-4 h-4 text-[var(--success-500)]" />Excel
                    </button>
                  )}
                  <div className="border-t border-[var(--border-primary)] my-1" />
                  <p className="px-4 py-1.5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Columnas</p>
                  {columns.filter(c => c.hideable !== false).map(col => (
                    <label key={col.key} className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors">
                      <input type="checkbox" checked={!hiddenCols.has(col.key)} onChange={() => toggleColumn(col.key)} className="rounded border-[var(--border-primary)] text-[var(--primary-500)] focus:ring-[var(--primary-200)]" />
                      {col.header}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto scrollbar-premium">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              {visibleCols.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:text-[var(--text-primary)] transition-colors' : ''}`}
                  style={{ width: col.width, textAlign: col.align || 'left' }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <span className="inline-flex flex-col">
                        <ChevronUp className={`w-3 h-3 -mb-1 ${sortKey === col.key && sortDir === 'asc' ? 'text-[var(--primary-500)]' : 'text-[var(--neutral-300)]'}`} />
                        <ChevronDown className={`w-3 h-3 ${sortKey === col.key && sortDir === 'desc' ? 'text-[var(--primary-500)]' : 'text-[var(--neutral-300)]'}`} />
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-secondary)]">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                      <Search className="w-6 h-6 text-[var(--text-tertiary)]" />
                    </div>
                    <p className="text-sm text-[var(--text-tertiary)]">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={keyExtractor(item)} className="hover:bg-[var(--primary-50)] dark:hover:bg-[rgba(99,102,241,0.04)] transition-colors duration-150">
                  {visibleCols.map(col => (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 text-sm text-[var(--text-secondary)] ${col.truncate ? 'max-w-[200px] truncate' : ''}`}
                      style={{ textAlign: col.align || 'left' }}
                      title={col.truncate ? (col.render ? undefined : String(getPath(item, col.key) ?? '')) : undefined}
                    >
                      {col.render ? col.render(item) : (
                        <span className="text-[var(--text-primary)]">{getPath(item, col.key) != null ? String(getPath(item, col.key)) : '-'}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">{(currentPage - 1) * (server ? server.limit : pageSize) + 1}</span>
            {' — '}
            <span className="font-medium text-[var(--text-primary)]">{Math.min(currentPage * (server ? server.limit : pageSize), server ? server.totalItems : sortedArr.length)}</span>
            {' de '}
            <span className="font-medium text-[var(--text-primary)]">{server ? server.totalItems : sortedArr.length}</span> registros
          </p>
          <div className="flex items-center gap-1">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-primary)] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-90"
              disabled={currentPage <= 1}
              onClick={() => (server ? server.onPageChange(server.page - 1) : setPage(p => Math.max(1, p - 1)))}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {getPaginationRange().map((p, i) =>
              p === '...' ? (
                <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-[var(--text-tertiary)]">...</span>
              ) : (
                <button
                  key={p}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all active:scale-90 ${
                    p === currentPage
                      ? 'bg-[var(--primary-700)] text-white shadow-sm shadow-[var(--primary-200)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:border-[var(--border-primary)] border border-transparent'
                  }`}
                  onClick={() => (server ? server.onPageChange(p) : setPage(p))}
                >
                  {p}
                </button>
              )
            )}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-primary)] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-90"
              disabled={currentPage >= totalPages}
              onClick={() => (server ? server.onPageChange(server.page + 1) : setPage(p => Math.min(totalPages, p + 1)))}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
