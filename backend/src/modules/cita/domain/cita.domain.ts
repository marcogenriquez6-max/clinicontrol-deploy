import { BaseEntity } from '../../../common/domain/base.entity';

export type EstadoCita =
  | 'pendiente'
  | 'programada'
  | 'confirmada'
  | 'en_curso'
  | 'completada'
  | 'cancelada'
  | 'no_asistio'
  | 'reprogramada';

const TRANSITIONS: Record<EstadoCita, EstadoCita[]> = {
  pendiente: ['confirmada', 'cancelada'],
  programada: ['confirmada', 'cancelada'],
  confirmada: ['en_curso', 'cancelada'],
  en_curso: ['completada', 'cancelada'],
  completada: [],
  cancelada: [],
  no_asistio: [],
  reprogramada: ['confirmada', 'cancelada'],
};

export interface CitaData {
  pacienteId: number;
  medicoId: number;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  estado?: EstadoCita;
  esVirtual?: boolean;
  motivo?: string;
  sucursalId?: number;
  observaciones?: string;
  creadoPorId: number;
  especialidadId?: number;
  servicioId?: number;
  tipoAtencionId?: number;
}

export class CitaDomain extends BaseEntity {
  constructor(
    public readonly pacienteId: number,
    public readonly medicoId: number,
    public fecha: Date,
    public horaInicio: string,
    public horaFin: string,
    id?: number,
    public estado: EstadoCita = 'programada',
    public esVirtual = false,
    public motivo?: string,
    public sucursalId?: number,
    public observaciones?: string,
    public creadoPorId?: number,
    public cancelacionMotivo?: string,
    public canceladoPorId?: number,
    public especialidadId?: number,
    public servicioId?: number,
    public tipoAtencionId?: number,
    public monto?: number,
  ) {
    super(id);
  }

  static create(data: CitaData): CitaDomain {
    CitaDomain.validarHorario(data.horaInicio, data.horaFin);
    return new CitaDomain(
      data.pacienteId,
      data.medicoId,
      data.fecha,
      data.horaInicio,
      data.horaFin,
      undefined,
      data.estado ?? 'programada',
      data.esVirtual ?? false,
      data.motivo,
      data.sucursalId,
      data.observaciones,
      data.creadoPorId,
      undefined,
      undefined,
      data.especialidadId,
      data.servicioId,
      data.tipoAtencionId,
    );
  }

  cancelar(motivo: string, usuarioId: number): void {
    this.validarTransicion('cancelada');
    this.estado = 'cancelada';
    this.cancelacionMotivo = motivo;
    this.canceladoPorId = usuarioId;
  }

  confirmar(): void {
    this.validarTransicion('confirmada');
    this.estado = 'confirmada';
  }

  iniciar(): void {
    this.validarTransicion('en_curso');
    this.estado = 'en_curso';
  }

  completar(): void {
    this.validarTransicion('completada');
    this.estado = 'completada';
  }

  marcarNoAsistio(): void {
    this.validarTransicion('no_asistio');
    this.estado = 'no_asistio';
  }

  reprogramar(
    nuevaFecha: Date,
    nuevaHoraInicio: string,
    nuevaHoraFin: string,
  ): void {
    CitaDomain.validarHorario(nuevaHoraInicio, nuevaHoraFin);
    this.fecha = nuevaFecha;
    this.horaInicio = nuevaHoraInicio;
    this.horaFin = nuevaHoraFin;
    this.estado = 'programada';
  }

  private validarTransicion(nuevoEstado: EstadoCita): void {
    const permitidos = TRANSITIONS[this.estado];
    if (!permitidos.includes(nuevoEstado)) {
      throw new Error(
        `Transicion de estado invalida: "${this.estado}" -> "${nuevoEstado}"`,
      );
    }
  }

  static validarHorario(horaInicio: string, horaFin: string): void {
    const [hI, mI] = horaInicio.split(':').map(Number);
    const [hF, mF] = horaFin.split(':').map(Number);
    const inicio = hI * 60 + mI;
    const fin = hF * 60 + mF;
    if (fin <= inicio) {
      throw new Error('La hora de fin debe ser posterior a la hora de inicio');
    }
    if (fin - inicio > 120) {
      throw new Error('La cita no puede exceder 120 minutos');
    }
  }
}
