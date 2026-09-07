import { BaseEntity } from '../../../common/domain/base.entity';

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  QR = 'qr',
  OTRO = 'otro',
}

export type EstadoTurno =
  | 'espera'
  | 'llamado'
  | 'atencion'
  | 'completado'
  | 'cancelado'
  | 'no_asistio';

const TRANSITIONS: Record<EstadoTurno, EstadoTurno[]> = {
  espera: ['llamado', 'atencion', 'cancelado', 'no_asistio'],
  llamado: ['atencion', 'cancelado', 'no_asistio'],
  atencion: ['completado', 'cancelado'],
  completado: [],
  cancelado: [],
  no_asistio: [],
};

export interface TurnoData {
  numero: number;
  prefijo?: string;
  pacienteId: number;
  medicoId: number;
  citaId?: number;
  tipoAtencionId?: number;
  tipo?: string;
  consultorio?: string;
  monto: number;
  pagado?: boolean;
  metodoPago?: MetodoPago;
  creadoPorId: number;
  fechaProgramada?: string;
  horaProgramada?: string;
}

export class TurnoDomain extends BaseEntity {
  constructor(
    public readonly numero: number,
    public readonly pacienteId: number,
    public readonly medicoId: number,
    public estado: EstadoTurno = 'espera',
    public monto: number = 0,
    public pagado = false,
    public pagadoEn?: Date,
    id?: number,
    public citaId?: number,
    public tipoAtencionId?: number,
    public tipo?: string,
    public pacienteNombre?: string,
    public pacienteCI?: string,
    public pacienteTel?: string,
    public medicoNombre?: string,
    public especialidad?: string,
    public consultorio?: string,
    public metodoPago?: MetodoPago,
    public prefijo?: string,
  ) {
    super(id);
    this.fechaProgramada = undefined;
    this.horaProgramada = undefined;
  }

  public fechaProgramada?: string;
  public horaProgramada?: string;
  /** Momento de emisión del turno (para la agenda del día). */
  public creadoEn?: Date;
  /** Triaje ESI-1/ESI-2 de hoy: puede pasar al médico sin pago previo. */
  public esUrgencia?: boolean;

  static create(data: TurnoData): TurnoDomain {
    const turno = new TurnoDomain(
      data.numero,
      data.pacienteId,
      data.medicoId,
      'espera',
      data.monto,
      data.pagado ?? false,
      undefined,
      undefined,
      data.citaId,
      data.tipoAtencionId,
      data.tipo,
    );
    turno.fechaProgramada = data.fechaProgramada;
    turno.horaProgramada = data.horaProgramada;
    turno.metodoPago = data.metodoPago;
    turno.consultorio = data.consultorio;
    turno.prefijo = data.prefijo;
    return turno;
  }

  llamar(): void {
    this.validarTransicion('llamado');
    this.estado = 'llamado';
  }

  iniciarAtencion(): void {
    this.validarTransicion('atencion');
    this.estado = 'atencion';
  }

  completar(): void {
    this.validarTransicion('completado');
    this.estado = 'completado';
  }

  cancelar(): void {
    this.validarTransicion('cancelado');
    this.estado = 'cancelado';
  }

  noAsistio(): void {
    this.validarTransicion('no_asistio');
    this.estado = 'no_asistio';
  }

  marcarPagado(metodoPago?: MetodoPago): void {
    this.pagado = true;
    this.pagadoEn = new Date();
    this.metodoPago = metodoPago;
  }

  private validarTransicion(nuevoEstado: EstadoTurno): void {
    const permitidos = TRANSITIONS[this.estado];
    if (!permitidos.includes(nuevoEstado)) {
      throw new Error(
        `Transicion de estado invalida: "${this.estado}" -> "${nuevoEstado}"`,
      );
    }
  }
}
