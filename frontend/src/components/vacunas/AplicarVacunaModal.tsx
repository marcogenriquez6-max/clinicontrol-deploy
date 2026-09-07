import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal, Select } from '../ui';
import type { Vacuna } from '../../types';

interface AplicarVacunaModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacunas: Vacuna[];
  selectedVacuna: Vacuna | null;
  loading: boolean;
  onSubmit: (data: Record<string, string>) => void;
}

const APLICACION_VALIDACIONES = {
  vacunaId: { required: 'Seleccione una vacuna' },
  dosisNumero: { required: 'Indique el número de dosis', min: { value: 1, message: 'La dosis debe ser >= 1' } },
  fechaAplicacion: { required: 'La fecha de aplicación es requerida', validate: (value: string) => !value || new Date(value) <= new Date(new Date().toDateString()) || 'La fecha no puede ser futura' },
};

export default function AplicarVacunaModal({
  isOpen,
  onClose,
  vacunas,
  selectedVacuna,
  loading,
  onSubmit,
}: AplicarVacunaModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({
        vacunaId: selectedVacuna?.id || '',
        dosisNumero: 1,
        fechaAplicacion: new Date().toISOString().split('T')[0],
        lote: '', laboratorio: '', lugarAplicacion: '', proximaDosis: '', observaciones: '',
      });
    }
  }, [isOpen, selectedVacuna, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aplicar Vacuna" accent="success">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {selectedVacuna && <p className="text-sm text-[var(--text-secondary)] mb-4">Aplicando: {selectedVacuna.nombre}</p>}
        <Select
          label="Vacuna"
          required
          options={[
            { value: '', label: 'Seleccionar vacuna...' },
            ...(vacunas || []).map(v => ({ value: v.id, label: v.nombre })),
          ]}
          error={errors.vacunaId?.message as string}
          {...register('vacunaId', APLICACION_VALIDACIONES.vacunaId)}
          defaultValue={selectedVacuna?.id || ''}
        />
        <Input label="Número de dosis" type="number" required error={errors.dosisNumero?.message as string} {...register('dosisNumero', { ...APLICACION_VALIDACIONES.dosisNumero, valueAsNumber: true })} />
        <Input label="Fecha de aplicación" type="date" required error={errors.fechaAplicacion?.message as string} {...register('fechaAplicacion', APLICACION_VALIDACIONES.fechaAplicacion)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Lote" placeholder="Ej: LOT123" {...register('lote')} />
          <Input label="Laboratorio" placeholder="Nombre del laboratorio" {...register('laboratorio')} />
        </div>
        <Input label="Lugar de aplicación" placeholder="Centro de salud" {...register('lugarAplicacion')} />
        <Input label="Próxima dosis" type="date" {...register('proximaDosis')} />
        <Input label="Observaciones" placeholder="Observaciones" {...register('observaciones')} />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>Aplicar</Button>
        </div>
      </form>
    </Modal>
  );
}
