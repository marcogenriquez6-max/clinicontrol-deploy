import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ConsultaDomain, SignosVitales } from '../consulta.domain';

@Injectable()
export class ConsultaDomainService {
  validarConsulta(
    motivo: string,
    sintomas: string,
    pacienteId: number,
    medicoId: number,
  ): string[] {
    const errores: string[] = [];
    if (!motivo?.trim()) errores.push('El motivo de consulta es requerido');
    if (!sintomas?.trim()) errores.push('Los síntomas son requeridos');
    if (!pacienteId || pacienteId <= 0)
      errores.push('El ID del paciente es requerido');
    if (!medicoId || medicoId <= 0)
      errores.push('El ID del médico es requerido');
    if (motivo && motivo.length < 5)
      errores.push('El motivo debe tener al menos 5 caracteres');
    if (motivo && motivo.length > 500)
      errores.push('El motivo no puede exceder 500 caracteres');
    if (sintomas && sintomas.length > 2000)
      errores.push('Los síntomas no pueden exceder 2000 caracteres');
    return errores;
  }

  validarSignosVitales(signos: SignosVitales): string[] {
    const errores: string[] = [];
    const rangos: Record<string, { min: number; max: number; label: string }> =
      {
        presionArterialSistolica: {
          min: 50,
          max: 250,
          label: 'Presión arterial sistólica',
        },
        presionArterialDiastolica: {
          min: 30,
          max: 150,
          label: 'Presión arterial diastólica',
        },
        frecuenciaCardiaca: { min: 30, max: 220, label: 'Frecuencia cardíaca' },
        frecuenciaRespiratoria: {
          min: 8,
          max: 40,
          label: 'Frecuencia respiratoria',
        },
        temperatura: { min: 30, max: 45, label: 'Temperatura' },
        saturacionOxigeno: {
          min: 50,
          max: 100,
          label: 'Saturación de oxígeno',
        },
        glucosaCapilar: { min: 20, max: 500, label: 'Glucosa capilar' },
        peso: { min: 1, max: 400, label: 'Peso' },
        // La talla se registra en centímetros (igual que en triaje): 30–250 cm.
        talla: { min: 30, max: 250, label: 'Talla (cm)' },
      };

    for (const [key, rango] of Object.entries(rangos)) {
      const valor = (signos as any)[key];
      if (valor !== undefined && valor !== null) {
        if (typeof valor !== 'number' || isNaN(valor)) {
          errores.push(`${rango.label} debe ser un número válido`);
        } else if (valor < rango.min || valor > rango.max) {
          errores.push(
            `${rango.label} (${valor}) está fuera del rango permitido [${rango.min}-${rango.max}]`,
          );
        }
      }
    }
    return errores;
  }

  validarDiagnostico(descripcion: string, tipo: string): string[] {
    const errores: string[] = [];
    const tiposValidos = ['principal', 'secundario', 'complicacion', 'cronico'];
    if (!descripcion?.trim())
      errores.push('La descripción del diagnóstico es requerida');
    if (!tiposValidos.includes(tipo))
      errores.push(
        `Tipo de diagnóstico inválido. Valores: ${tiposValidos.join(', ')}`,
      );
    return errores;
  }

  validarContinuacion(
    consultaOriginalId?: number,
    motivoContinuacion?: string,
  ): string[] {
    const errores: string[] = [];
    if (!consultaOriginalId)
      errores.push('Se requiere el ID de la consulta original para continuar');
    if (!motivoContinuacion?.trim())
      errores.push('Se requiere el motivo de continuación');
    return errores;
  }

  detectarSignosAlarma(signos: SignosVitales): string[] {
    const alertas: string[] = [];
    if (
      signos.presionArterialSistolica &&
      signos.presionArterialSistolica >= 180
    ) {
      alertas.push('⚠️ CRISIS HIPERTENSIVA: PAS ≥ 180 mmHg');
    }
    if (
      signos.presionArterialDiastolica &&
      signos.presionArterialDiastolica >= 120
    ) {
      alertas.push('⚠️ CRISIS HIPERTENSIVA: PAD ≥ 120 mmHg');
    }
    if (signos.frecuenciaCardiaca && signos.frecuenciaCardiaca > 120) {
      alertas.push('⚠️ TAQUICARDIA: FC > 120 lpm');
    }
    if (signos.frecuenciaCardiaca && signos.frecuenciaCardiaca < 40) {
      alertas.push('⚠️ BRADICARDIA: FC < 40 lpm');
    }
    if (signos.temperatura && signos.temperatura >= 39) {
      alertas.push('⚠️ FIEBRE ALTA: Temperatura ≥ 39°C');
    }
    if (
      signos.saturacionOxigeno !== undefined &&
      signos.saturacionOxigeno < 90
    ) {
      alertas.push('⚠️ HIPOXEMIA SEVERA: SpO2 < 90%');
    }
    if (signos.glucosaCapilar && signos.glucosaCapilar > 250) {
      alertas.push('⚠️ HIPERGLUCEMIA: Glucosa > 250 mg/dL');
    }
    if (signos.glucosaCapilar && signos.glucosaCapilar < 54) {
      alertas.push('⚠️ HIPOGLUCEMIA SEVERA: Glucosa < 54 mg/dL');
    }
    return alertas;
  }

  /**
   * Validación de inmutabilidad expediente
   *
   * Reglas definidas en la especificación:
   * - Los 7 campos SOAP (motivo, síntomas, enfermedad actual, examen físico,
   *    evaluación, plan, indicaciones) están protegidos.
   * - Solo el médico autor (mismo que creó) puede modificar dentro de 24 horas.
   * - Vencida la ventana (24h) → ConflictException (409).
   * - Otro médico intenta modificar → ForbiddenException (403).
   * - Toda enmienda queda en auditoría con valor anterior y nuevo.
   *
   * NOTA: Esta validación requiere acceso a la base de datos para consultar
   * la fecha de creación y el médico autor de la consulta. El método completo
   * se implementará en el service application que tiene acceso al repositorio.
   *
   * @param consultaId ID de la consulta a modificar
   * @param medicoId ID del médico que intenta la modificación
   * @param ahora Fecha/hora actual (por defecto ahora)
   * @returns Objeto con estado de validación
   */
  validarInmutabilidadExpediente(
    consultaId: number,
    medicoId: number,
    ahora: Date = new Date(),
  ): {
    puedeModificar: boolean;
    tiempoRestanteMinutos: number | null;
    esMismoMédico: boolean;
    error?: string;
  } {
    return {
      puedeModificar: false,
      tiempoRestanteMinutos: null,
      esMismoMédico: false,
      error: 'Validar en service application con acceso a repositorio',
    };
  }
}
