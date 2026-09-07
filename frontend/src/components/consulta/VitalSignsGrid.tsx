import { Weight, Ruler, Thermometer, Heart, Droplets, Activity } from 'lucide-react';
import { Input } from '../ui';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';

interface VitalSignsGridProps {
  register: UseFormRegister<any>;
  errors?: FieldErrors;
  peso?: string;
  talla?: string;
}

function calculateIMC(peso: string, talla: string): string | null {
  const p = parseFloat(peso);
  const t = parseFloat(talla);
  if (p > 0 && t > 0) return (p / ((t / 100) ** 2)).toFixed(1);
  return null;
}

const RULES = {
  peso: { required: 'Campo requerido', min: { value: 0.5, message: 'Mínimo 0.5 kg' }, max: { value: 500, message: 'Máximo 500 kg' } },
  talla: { required: 'Campo requerido', min: { value: 10, message: 'Mínimo 10 cm' }, max: { value: 280, message: 'Máximo 280 cm' } },
  temperatura: { min: { value: 34, message: 'Mínimo 34°C' }, max: { value: 43, message: 'Máximo 43°C' } },
  frecuenciaCardiaca: { min: { value: 20, message: 'Mínimo 20 lpm' }, max: { value: 250, message: 'Máximo 250 lpm' } },
  frecuenciaRespiratoria: { min: { value: 4, message: 'Mínimo 4 rpm' }, max: { value: 80, message: 'Máximo 80 rpm' } },
  presionArterialSistolica: { min: { value: 30, message: 'Mínimo 30 mmHg' }, max: { value: 300, message: 'Máximo 300 mmHg' } },
  presionArterialDiastolica: { min: { value: 30, message: 'Mínimo 30 mmHg' }, max: { value: 300, message: 'Máximo 300 mmHg' } },
  saturacionOxigeno: { min: { value: 30, message: 'Mínimo 30%' }, max: { value: 100, message: 'Máximo 100%' } },
  glucosaCapilar: { min: { value: 20, message: 'Mínimo 20 mg/dL' }, max: { value: 700, message: 'Máximo 700 mg/dL' } },
};

function getError(errors: FieldErrors | undefined, field: string): string | undefined {
  return errors?.[field]?.message as string | undefined;
}

export default function VitalSignsGrid({ register, errors, peso = '', talla = '' }: VitalSignsGridProps) {
  const imc = calculateIMC(peso, talla);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Input label="Peso (kg)" type="number" step="0.1" placeholder="Ej: 70" prefix={<Weight className="w-4 h-4" />} error={getError(errors, 'peso')} {...register('peso', RULES.peso)} />
        <Input label="Talla (cm)" type="number" step="0.1" placeholder="Ej: 170" prefix={<Ruler className="w-4 h-4" />} error={getError(errors, 'talla')} {...register('talla', RULES.talla)} />
        <Input label="Temperatura (°C)" type="number" step="0.1" placeholder="Ej: 36.5" prefix={<Thermometer className="w-4 h-4" />} error={getError(errors, 'temperatura')} {...register('temperatura', RULES.temperatura)} />
        <Input label="Frecuencia cardíaca (lpm)" type="number" placeholder="Ej: 72" prefix={<Heart className="w-4 h-4" />} error={getError(errors, 'frecuenciaCardiaca')} {...register('frecuenciaCardiaca', RULES.frecuenciaCardiaca)} />
        <Input label="Frecuencia respiratoria (rpm)" type="number" placeholder="Ej: 16" prefix={<Droplets className="w-4 h-4" />} error={getError(errors, 'frecuenciaRespiratoria')} {...register('frecuenciaRespiratoria', RULES.frecuenciaRespiratoria)} />
        <Input label="Saturación O₂ (%)" type="number" placeholder="Ej: 98" prefix={<Activity className="w-4 h-4" />} error={getError(errors, 'saturacionOxigeno')} {...register('saturacionOxigeno', RULES.saturacionOxigeno)} />
        <Input label="Presión arterial sistólica" type="number" placeholder="Ej: 120" error={getError(errors, 'presionArterialSistolica')} {...register('presionArterialSistolica', RULES.presionArterialSistolica)} />
        <Input label="Presión arterial diastólica" type="number" placeholder="Ej: 80" error={getError(errors, 'presionArterialDiastolica')} {...register('presionArterialDiastolica', RULES.presionArterialDiastolica)} />
        <Input label="Glucosa capilar" type="number" step="0.1" placeholder="Ej: 100" error={getError(errors, 'glucosaCapilar')} {...register('glucosaCapilar', RULES.glucosaCapilar)} />
      </div>

      {imc && (
        <div className="mb-4 p-3 bg-[var(--primary-50)] rounded-lg border border-[var(--primary-200)]">
          <p className="text-sm font-medium text-black dark:text-[var(--primary-800)]">
            IMC: <span className="text-lg font-bold">{imc}</span> kg/m²
          </p>
        </div>
      )}
    </>
  );
}
