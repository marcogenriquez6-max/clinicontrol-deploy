import { Plus, Trash2, Search, Shield, AlertTriangle } from 'lucide-react';
import { Button, Input, Select } from '../ui';

interface MedicamentoEntry {
  key: number;
  search: string;
  medicamentoId?: number;
  medicamentoNombre?: string;
  dosis: string;
  frecuencia: string;
  via: string;
  duracion: string;
  cantidad: number;
  observaciones: string;
}

interface MedicamentoListProps {
  medicamentos: MedicamentoEntry[];
  onAdd: () => void;
  onRemove: (key: number) => void;
  onUpdate: (key: number, field: keyof MedicamentoEntry, value: any) => void;
  onMedSearch: (key: number, query: string) => void;
  onSelectMed: (key: number, item: any) => void;
  medSearchResults: Record<number, any[]>;
  onVerificarSeguridad: () => void;
  onVerificarInteracciones: () => void;
}

const VIA_OPTIONS = [
  { value: '', label: 'Seleccionar vía...' },
  { value: 'oral', label: 'Oral' },
  { value: 'intravenosa', label: 'Intravenosa' },
  { value: 'intramuscular', label: 'Intramuscular' },
  { value: 'subcutanea', label: 'Subcutánea' },
  { value: 'topica', label: 'Tópica' },
  { value: 'inhalada', label: 'Inhalada' },
  { value: 'rectal', label: 'Rectal' },
  { value: 'sublingual', label: 'Sublingual' },
  { value: 'otica', label: 'Ótica' },
  { value: 'oftalmica', label: 'Oftálmica' },
];

export default function MedicamentoList({ medicamentos, onAdd, onRemove, onUpdate, onMedSearch, onSelectMed, medSearchResults, onVerificarSeguridad, onVerificarInteracciones }: MedicamentoListProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[var(--text-secondary)]">Recetas / Medicamentos</h4>
        <div className="flex gap-2">
          {medicamentos.length >= 1 && (
            <Button type="button" variant="outline" size="sm" onClick={onVerificarSeguridad}>
              <Shield className="w-4 h-4 mr-1" />Verificar Seguridad
            </Button>
          )}
          {medicamentos.length >= 2 && (
            <Button type="button" variant="outline" size="sm" onClick={onVerificarInteracciones}>
              <AlertTriangle className="w-4 h-4 mr-1" />Verificar interacciones
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onAdd}>
            <Plus className="w-4 h-4 mr-1" />Agregar medicamento
          </Button>
        </div>
      </div>
      {medicamentos.length === 0 && (
        <p className="text-sm text-[var(--text-tertiary)] italic">No hay medicamentos registrados.</p>
      )}
      {medicamentos.map((med) => (
        <div key={med.key} className="p-4 mb-3 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] relative">
          <button
            type="button"
            onClick={() => onRemove(med.key)}
            className="absolute top-2 right-2 p-1 text-[var(--text-tertiary)] hover:text-[var(--danger-500)] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Medicamento *</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={med.search}
                  onChange={(e) => onMedSearch(med.key, e.target.value)}
                  placeholder="Buscar medicamento..."
                  className="w-full pl-10 text-sm px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border-[var(--border-primary)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] transition-all duration-200"
                />
              </div>
              {medSearchResults[med.key]?.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg shadow-[var(--shadow-lg)] max-h-40 overflow-y-auto">
                  {medSearchResults[med.key].map((item: any) => (
                    <li
                      key={item.id}
                      onClick={() => onSelectMed(med.key, item)}
                      className="px-3 py-2 text-sm hover:bg-[var(--bg-secondary)] cursor-pointer border-b border-[var(--border-primary)] last:border-0 transition-colors"
                    >
                      {item.nombre}
                      {item.presentacion && <span className="text-[var(--text-tertiary)] ml-1">({item.presentacion})</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Input
              label="Dosis"
              placeholder="Ej: 500 mg"
              value={med.dosis}
              onChange={(e) => onUpdate(med.key, 'dosis', e.target.value)}
            />
            <Input
              label="Frecuencia"
              placeholder="Ej: cada 8 horas"
              value={med.frecuencia}
              onChange={(e) => onUpdate(med.key, 'frecuencia', e.target.value)}
            />
            <Select
              label="Vía"
              options={VIA_OPTIONS}
              value={med.via}
              onChange={(e: any) => onUpdate(med.key, 'via', e.target.value)}
            />
            <Input
              label="Duración"
              placeholder="Ej: 7 días"
              value={med.duracion}
              onChange={(e) => onUpdate(med.key, 'duracion', e.target.value)}
            />
            <Input
              label="Cantidad"
              type="number"
              placeholder="Ej: 1"
              value={med.cantidad || ''}
              onChange={(e) => onUpdate(med.key, 'cantidad', Number(e.target.value))}
            />
          </div>
          <div className="mt-3">
            <Input
              label="Observaciones"
              placeholder="Observaciones adicionales..."
              value={med.observaciones}
              onChange={(e) => onUpdate(med.key, 'observaciones', e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
