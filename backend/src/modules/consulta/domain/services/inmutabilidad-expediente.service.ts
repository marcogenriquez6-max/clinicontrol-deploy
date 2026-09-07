import { Injectable } from '@nestjs/common';
import {
  ExpedienteInmutableException,
  EnmiendaNoAutorizadaException,
} from '../exceptions/expediente-inmutable.exception';

/** Campos del registro SOAP protegidos por la norma. */
export const CAMPOS_ASISTENCIALES = [
  'motivo',
  'sintomas',
  'enfermedadActual',
  'examenFisico',
  'evaluacion',
  'planTratamiento',
  'indicaciones',
] as const;

/**
 * Politica de inmutabilidad del expediente clinico.
 *
 * Invariante del agregado ConsultaMedica: la nota asistencial admite
 * correccion directa unicamente dentro de una ventana breve posterior a su
 * registro y solo por su autor. Vencida esa ventana el texto original es
 * inmutable y toda correccion se documenta como nota de enmienda.
 *
 * Capa de dominio: sin acceso a base de datos ni a HTTP.
 */
@Injectable()
export class InmutabilidadExpedienteService {
  /** Ventana de enmienda directa, en horas, contada desde el registro. */
  static readonly VENTANA_ENMIENDA_HORAS = 24;

  /** True si el cambio solicitado toca algun campo asistencial protegido. */
  afectaContenidoAsistencial(cambios: Record<string, unknown>): boolean {
    return CAMPOS_ASISTENCIALES.some(
      (campo) => cambios[campo] !== undefined && cambios[campo] !== null,
    );
  }

  /** Horas transcurridas desde el registro de la consulta. */
  horasDesdeRegistro(registradaEn: Date, ahora: Date = new Date()): number {
    const ms = ahora.getTime() - new Date(registradaEn).getTime();
    return Math.max(0, Math.floor(ms / 3_600_000));
  }

  /**
   * Verifica que la enmienda sea admisible. No devuelve valor: si la operacion
   * viola la norma lanza la excepcion de dominio correspondiente.
   */
  verificarEnmienda(params: {
    consultaId: number;
    registradaEn: Date;
    autorMedicoId: number;
    solicitanteMedicoId?: number;
    cambios: Record<string, unknown>;
    ahora?: Date;
  }): void {
    if (!this.afectaContenidoAsistencial(params.cambios)) return;

    const horas = this.horasDesdeRegistro(
      params.registradaEn,
      params.ahora ?? new Date(),
    );

    if (horas >= InmutabilidadExpedienteService.VENTANA_ENMIENDA_HORAS) {
      throw new ExpedienteInmutableException(
        params.consultaId,
        horas,
        InmutabilidadExpedienteService.VENTANA_ENMIENDA_HORAS,
      );
    }

    if (
      params.solicitanteMedicoId !== undefined &&
      Number(params.solicitanteMedicoId) !== Number(params.autorMedicoId)
    ) {
      throw new EnmiendaNoAutorizadaException(params.consultaId);
    }
  }

  /** Campos asistenciales que realmente cambian, para el registro de auditoria. */
  diferencias(
    original: Record<string, unknown>,
    cambios: Record<string, unknown>,
  ): { antes: Record<string, unknown>; despues: Record<string, unknown> } {
    const antes: Record<string, unknown> = {};
    const despues: Record<string, unknown> = {};
    for (const campo of CAMPOS_ASISTENCIALES) {
      const nuevo = cambios[campo];
      if (nuevo === undefined || nuevo === null) continue;
      if (original[campo] !== nuevo) {
        antes[campo] = original[campo] ?? null;
        despues[campo] = nuevo;
      }
    }
    return { antes, despues };
  }
}
