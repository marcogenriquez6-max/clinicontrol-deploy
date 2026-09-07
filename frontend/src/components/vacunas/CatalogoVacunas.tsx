import { Pencil, Trash2, Syringe } from 'lucide-react';
import { Button } from '../ui';
import DataTable from '../ui/DataTable';
import type { Vacuna } from '../../types';

interface CatalogoVacunasProps {
  vacunas: Vacuna[];
  loading: boolean;
  onEdit: (vacuna: Vacuna) => void;
  onDelete: (id: number, name: string) => void;
  onNueva: () => void;
}

export default function CatalogoVacunas({
  vacunas,
  loading,
  onEdit,
  onDelete,
  onNueva,
}: CatalogoVacunasProps) {
  return (
    <DataTable<Vacuna>
      title="Catálogo de Vacunas"
      subtitle={`${vacunas.length} vacunas registradas`}
      searchPlaceholder="Buscar vacuna por nombre..."
      searchKeys={['nombre']}
      loading={loading}
      emptyMessage="No hay vacunas registradas"
      toolbar={
        <Button variant="primary" size="sm" onClick={onNueva}>
          <Syringe className="w-4 h-4" />Nueva Vacuna
        </Button>
      }
      columns={[
        { key: 'nombre', header: 'Nombre', render: (v) => (
          <span className="font-medium text-[var(--text-primary)]">{v.nombre}</span>
        ) },
        { key: 'dosisRecomendadas', header: 'Dosis' },
        { key: 'edad', header: 'Edad', render: (v) => (
          v.edadMinimaMeses != null ? `${v.edadMinimaMeses} - ${v.edadMaximaMeses ?? '∞'} meses` : 'Sin especificar'
        ) },
        { key: 'obligatoria', header: 'Obligatoria', align: 'center', width: '120px', render: (v) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            v.esObligatoria ? 'bg-[var(--danger-100)] text-[var(--danger-700)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
          }`}>{v.esObligatoria ? 'Sí' : 'No'}</span>
        ) },
        { key: 'acciones', header: 'Acciones', align: 'right', width: '110px', sortable: false, render: (v) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" icon onClick={() => onEdit(v)} aria-label={`Editar ${v.nombre}`}><Pencil className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" icon onClick={() => onDelete(v.id!, v.nombre)} aria-label={`Eliminar ${v.nombre}`}>
              <Trash2 className="w-4 h-4 text-[var(--danger-500)]" />
            </Button>
          </div>
        ) },
      ]}
      data={vacunas}
      keyExtractor={(v) => v.id!}
      filters={[{
        key: 'obligatoria',
        label: 'Obligatoria',
        options: [{ value: 'si', label: 'Solo obligatorias' }],
        predicate: (v) => v.esObligatoria,
      }]}
    />
  );
}
