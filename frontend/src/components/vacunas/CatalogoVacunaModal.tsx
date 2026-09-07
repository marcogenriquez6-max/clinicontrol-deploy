import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../ui';
import type { Vacuna } from '../../types';

interface CatalogoVacunaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingVacuna: Vacuna | null;
  loading: boolean;
  onSubmit: (data: Record<string, string>) => void;
}

const CATALOGO_VALIDACIONES = {
  nombre: { required: 'El nombre es requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } },
  dosisRecomendadas: { required: 'Indique las dosis', min: { value: 1, message: 'Mínimo 1 dosis' } },
};

export default function CatalogoVacunaModal({
  isOpen,
  onClose,
  editingVacuna,
  loading,
  onSubmit,
}: CatalogoVacunaModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (editingVacuna) {
        reset({
          nombre: editingVacuna.nombre,
          descripcion: editingVacuna.descripcion || '',
          dosisRecomendadas: editingVacuna.dosisRecomendadas,
          edadMinimaMeses: editingVacuna.edadMinimaMeses || '',
          edadMaximaMeses: editingVacuna.edadMaximaMeses || '',
          intervalodias: editingVacuna.intervalodias || '',
          esObligatoria: editingVacuna.esObligatoria,
        });
      } else {
        reset({
          nombre: '', descripcion: '', dosisRecomendadas: 1,
          edadMinimaMeses: '', edadMaximaMeses: '', intervalodias: '', esObligatoria: false,
        });
      }
    }
  }, [isOpen, editingVacuna, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingVacuna ? 'Editar Vacuna' : 'Nueva Vacuna'} accent="primary">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {editingVacuna && <p className="text-sm text-[var(--text-secondary)] mb-4">Editando: {editingVacuna.nombre}</p>}
        <Input label="Nombre" placeholder="Nombre de la vacuna" required error={errors.nombre?.message as string} {...register('nombre', CATALOGO_VALIDACIONES.nombre)} />
        <Input label="Descripción" placeholder="Descripción" {...register('descripcion')} />
        <Input label="Dosis recomendadas" type="number" required error={errors.dosisRecomendadas?.message as string} {...register('dosisRecomendadas', { ...CATALOGO_VALIDACIONES.dosisRecomendadas, valueAsNumber: true })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Edad mínima (meses)" type="number" placeholder="Ej: 0" {...register('edadMinimaMeses')} />
          <Input label="Edad máxima (meses)" type="number" placeholder="Ej: 12" {...register('edadMaximaMeses', { validate: (value, values) => !value || !values.edadMinimaMeses || Number(value) >= Number(values.edadMinimaMeses) || 'Edad máxima debe ser mayor o igual a la mínima' })} />
        </div>
        <Input label="Intervalo entre dosis (días)" type="number" placeholder="Ej: 30" {...register('intervalodias')} />
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded border-[var(--border-primary)] text-[var(--primary-600)]" {...register('esObligatoria')} />
          <span className="text-sm text-[var(--text-secondary)]">Vacuna obligatoria</span>
        </label>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>{editingVacuna ? 'Actualizar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
}
