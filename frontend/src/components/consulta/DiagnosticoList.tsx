import { Plus, Trash2, Search } from 'lucide-react';
import { Button, Input, Select } from '../ui';

interface DiagnosticoEntry {
  key: number;
  cie10Search: string;
  cie10Id?: number;
  descripcion: string;
  tipo: 'principal' | 'secundario' | 'complicacion' | 'cronico';
  esCronico: boolean;
}

interface DiagnosticoListProps {
  diagnosticos: DiagnosticoEntry[];
  onAdd: () => void;
  onRemove: (key: number) => void;
  onUpdate: (key: number, field: keyof DiagnosticoEntry, value: any) => void;
  onCieSearch: (key: number, query: string) => void;
  onSelectCie: (key: number, item: any) => void;
  cieSearchResults: Record<number, any[]>;
}

const DIAGNOSTICO_TIPOS = [
  { value: 'principal', label: 'Principal' },
  { value: 'secundario', label: 'Secundario' },
  { value: 'complicacion', label: 'Complicación' },
  { value: 'cronico', label: 'Crónico' },
];

export default function DiagnosticoList({ diagnosticos, onAdd, onRemove, onUpdate, onCieSearch, onSelectCie, cieSearchResults }: DiagnosticoListProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[var(--text-secondary)]">Diagnósticos</h4>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1" />Agregar diagnóstico
        </Button>
      </div>
      {diagnosticos.length === 0 && (
        <p className="text-sm text-[var(--text-tertiary)] italic">No hay diagnósticos registrados.</p>
      )}
      {diagnosticos.map((diag) => (
        <div key={diag.key} className="p-4 mb-3 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] relative">
          <button
            type="button"
            onClick={() => onRemove(diag.key)}
            className="absolute top-2 right-2 p-1 text-[var(--text-tertiary)] hover:text-[var(--danger-500)] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">CIE-10</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={diag.cie10Search}
                  onChange={(e) => onCieSearch(diag.key, e.target.value)}
                  placeholder="Buscar código CIE-10..."
                  className="w-full pl-10 text-sm px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border-[var(--border-primary)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] transition-all duration-200"
                />
              </div>
              {cieSearchResults[diag.key]?.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg shadow-[var(--shadow-lg)] max-h-40 overflow-y-auto">
                  {cieSearchResults[diag.key].map((item: any) => (
                    <li
                      key={item.id}
                      onClick={() => onSelectCie(diag.key, item)}
                      className="px-3 py-2 text-sm hover:bg-[var(--bg-secondary)] cursor-pointer border-b border-[var(--border-primary)] last:border-0 transition-colors"
                    >
                      <span className="font-mono font-medium text-[var(--text-primary)]">{item.codigo}</span> - {item.descripcion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Select
              label="Tipo"
              options={DIAGNOSTICO_TIPOS}
              value={diag.tipo}
              onChange={(e: any) => onUpdate(diag.key, 'tipo', e.target.value)}
            />
          </div>
          <div className="mt-3">
            <Input
              label="Descripción"
              placeholder="Descripción del diagnóstico..."
              value={diag.descripcion}
              onChange={(e) => onUpdate(diag.key, 'descripcion', e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={diag.esCronico}
              onChange={(e) => onUpdate(diag.key, 'esCronico', e.target.checked)}
              className="rounded border-[var(--neutral-300)] text-[var(--primary-600)] focus:ring-[var(--primary-500)]"
            />
            Es crónico
          </label>
        </div>
      ))}
    </div>
  );
}
