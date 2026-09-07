import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Modal, Input, Select, Textarea, FormSection } from '../ui';
import { toast } from '../ui/Toast';
import { errMsg } from '../../api/errMsg';
import { triageService } from '../../api/triage.service';
import type { Paciente } from '../../types';

export const NIVELES_ESI = [
  { nivel: 1, label: 'ESI-1 — Reanimación (riesgo vital inmediato)' },
  { nivel: 2, label: 'ESI-2 — Emergencia (alto riesgo)' },
  { nivel: 3, label: 'ESI-3 — Urgente' },
  { nivel: 4, label: 'ESI-4 — Menor urgencia' },
  { nivel: 5, label: 'ESI-5 — No urgente' },
];

interface FormValues {
  pacienteId: string;
  esiNivel: string;
  temperatura?: string;
  presionSistolica?: string;
  presionDiastolica?: string;
  peso?: string;
  talla?: string;
  frecuenciaCardiaca?: string;
  spo2?: string;
  frecuenciaRespiratoria?: string;
  motivoConsulta?: string;
  observaciones?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  pacientes: Paciente[];
  /** Si viene, el paciente queda fijo (p. ej. desde Pacientes en Espera). */
  pacienteId?: number;
  pacienteNombre?: string;
  titulo?: string;
}

const num = (v?: string) => (v === '' || v === undefined || v === null ? undefined : Number(v));

/**
 * Formulario de triaje ESI: signos vitales (temperatura, presión, peso, talla,
 * frecuencia cardíaca, saturación), clasificación ESI-1..5 y observaciones clínicas.
 */
export default function TriajeFormModal({ isOpen, onClose, onSaved, pacientes, pacienteId, pacienteNombre, titulo }: Props) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (isOpen) {
      reset({
        pacienteId: pacienteId ? String(pacienteId) : '',
        esiNivel: '',
        temperatura: '', presionSistolica: '', presionDiastolica: '', peso: '', talla: '',
        frecuenciaCardiaca: '', spo2: '', frecuenciaRespiratoria: '', motivoConsulta: '', observaciones: '',
      });
    }
  }, [isOpen, pacienteId, reset]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      await triageService.create({
        pacienteId: Number(data.pacienteId),
        esiNivel: Number(data.esiNivel),
        temperatura: num(data.temperatura),
        presionSistolica: num(data.presionSistolica),
        presionDiastolica: num(data.presionDiastolica),
        peso: num(data.peso),
        talla: num(data.talla),
        frecuenciaCardiaca: num(data.frecuenciaCardiaca),
        spo2: num(data.spo2),
        frecuenciaRespiratoria: num(data.frecuenciaRespiratoria),
        motivoConsulta: data.motivoConsulta?.trim() || undefined,
        observaciones: data.observaciones?.trim() || undefined,
      });
      toast('success', 'Triaje registrado', `Paciente clasificado como ESI-${data.esiNivel}`);
      onSaved?.();
      onClose();
    } catch (e) {
      toast('error', 'No se pudo registrar el triaje', errMsg(e, 'Revise los signos vitales y el nivel ESI'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo ?? 'Registrar Triaje ESI'} size="lg" accent="danger">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title="Paciente y clasificación" color="blue">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pacienteId ? (
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Paciente</p>
                <p className="px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-sm font-medium text-[var(--text-primary)]">{pacienteNombre ?? `Paciente #${pacienteId}`}</p>
                <input type="hidden" {...register('pacienteId', { required: true })} />
              </div>
            ) : (
              <Select label="Paciente" placeholder="Seleccionar paciente..." required
                options={(pacientes || []).filter((p) => p.id !== undefined).map((p) => ({ value: p.id!, label: `${p.nombre} ${p.apellido} — ${p.ci}` }))}
                error={errors.pacienteId?.message as string} {...register('pacienteId', { required: 'El paciente es requerido' })} />
            )}
            <Select label="Clasificación ESI" placeholder="Seleccionar nivel..." required
              options={NIVELES_ESI.map((e) => ({ value: e.nivel, label: e.label }))}
              error={errors.esiNivel?.message as string} {...register('esiNivel', { required: 'El nivel ESI es requerido' })} />
          </div>
        </FormSection>

        <div className="border-t pt-5" style={{ borderColor: 'var(--border-secondary)' }}>
          <FormSection title="Signos vitales" color="emerald">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Input label="Temperatura (°C)" type="number" step="0.1" placeholder="36.5" {...register('temperatura')} />
              <Input label="Presión sistólica" type="number" placeholder="120" {...register('presionSistolica')} />
              <Input label="Presión diastólica" type="number" placeholder="80" {...register('presionDiastolica')} />
              <Input label="Peso (kg)" type="number" step="0.1" placeholder="70" {...register('peso')} />
              <Input label="Talla (cm)" type="number" step="0.1" placeholder="165" {...register('talla')} />
              <Input label="Frecuencia cardíaca" type="number" placeholder="80" {...register('frecuenciaCardiaca')} />
              <Input label="Saturación O₂ (%)" type="number" placeholder="98" {...register('spo2')} />
              <Input label="Frecuencia respiratoria" type="number" placeholder="16" {...register('frecuenciaRespiratoria')} />
            </div>
          </FormSection>
        </div>

        <div className="border-t pt-5 space-y-4" style={{ borderColor: 'var(--border-secondary)' }}>
          <Input label="Motivo de consulta" placeholder="Motivo por el que acude el paciente" {...register('motivoConsulta')} />
          <Textarea label="Observaciones clínicas" placeholder="Hallazgos relevantes, antecedentes referidos, alergias mencionadas..." {...register('observaciones')} />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>Registrar Triaje</Button>
        </div>
      </form>
    </Modal>
  );
}
