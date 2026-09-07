/**
 * Excepcion de dominio del Contexto de Historia Clinica Electronica.
 *
 * Se lanza cuando se intenta modificar una nota clinica ya consolidada.
 * Sustento normativo:
 *  - Ley N 3131 del Ejercicio Profesional Medico (Bolivia).
 *  - Resolucion Ministerial N 0090, Norma Nacional para el Manejo del
 *    Expediente Clinico: el registro asistencial es un documento medico-legal;
 *    una vez consolidado no se corrige sobre el texto original, se agrega una
 *    nota de enmienda que deja constancia de quien corrige, cuando y por que.
 */
export class ExpedienteInmutableException extends Error {
  readonly codigo = 'EXPEDIENTE_INMUTABLE';

  constructor(
    readonly consultaId: number,
    readonly horasTranscurridas: number,
    readonly ventanaHoras: number,
  ) {
    super(
      `La consulta ${consultaId} ya no admite modificacion directa: ` +
        `transcurrieron ${horasTranscurridas} horas y la ventana de enmienda ` +
        `es de ${ventanaHoras} horas. Registre una nota de enmienda ` +
        `(R.M. 0090 - Manejo del Expediente Clinico).`,
    );
    this.name = 'ExpedienteInmutableException';
  }
}

/** Se lanza cuando un medico distinto al autor intenta enmendar la nota. */
export class EnmiendaNoAutorizadaException extends Error {
  readonly codigo = 'ENMIENDA_NO_AUTORIZADA';

  constructor(readonly consultaId: number) {
    super(
      `Solo el medico que suscribio la consulta ${consultaId} puede enmendarla. ` +
        `Otro profesional debe agregar una nota de evolucion firmada a su nombre.`,
    );
    this.name = 'EnmiendaNoAutorizadaException';
  }
}
