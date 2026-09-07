import { BloqueoAgendaTipo } from '../../../entities/bloqueo-agenda.entity';

export class HorarioMedicoDomain {
  constructor(
    public readonly id?: number,
    public medicoId?: number,
    public diaSemana?: number,
    public horaInicio?: string,
    public horaFin?: string,
    public horaInicioTarde?: string,
    public horaFinTarde?: string,
    public duracionSlotMinutos = 30,
    public activo = true,
  ) {}
}

export class BloqueoAgendaDomain {
  constructor(
    public readonly id?: number,
    public medicoId?: number,
    public fechaInicio?: string,
    public fechaFin?: string,
    public horaInicio?: string,
    public horaFin?: string,
    public motivo?: string,
    public tipo?: BloqueoAgendaTipo,
  ) {}
}

export class SlotDisponibleDto {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  estado?: string;
}
