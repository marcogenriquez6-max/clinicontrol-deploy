export type CajaEstado = 'abierta' | 'cerrada';

export interface CobroResult {
  valido: boolean;
  vuelto: number;
  mensaje: string;
}

export class CajaSessionDomain {
  constructor(
    public id: number,
    public fechaApertura: Date,
    public montoInicial: number,
    public estado: CajaEstado,
    public usuarioId: number,
    public fechaCierre?: Date,
    public montoFinal?: number,
    public observaciones?: string,
    public createdAt?: Date,
  ) {}

  cerrar(montoFinal: number, observaciones?: string): void {
    this.estado = 'cerrada';
    this.fechaCierre = new Date();
    this.montoFinal = montoFinal;
    this.observaciones = observaciones;
  }

  cobrar(montoRecibido: number): CobroResult {
    if (this.estado !== 'abierta') {
      return { valido: false, vuelto: 0, mensaje: 'La sesión no está abierta' };
    }
    const vuelto = montoRecibido - this.montoInicial;
    if (vuelto < 0) {
      return {
        valido: false,
        vuelto: 0,
        mensaje: 'El monto recibido es menor al fondo inicial',
      };
    }
    return { valido: true, vuelto, mensaje: 'Cobro registrado exitosamente' };
  }
}
