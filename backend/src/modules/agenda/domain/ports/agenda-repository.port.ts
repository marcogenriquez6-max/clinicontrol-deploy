import {
  HorarioMedicoDomain,
  BloqueoAgendaDomain,
  SlotDisponibleDto,
} from '../agenda.domain';

export abstract class AgendaRepositoryPort {
  abstract getHorarios(medicoId: number): Promise<HorarioMedicoDomain[]>;
  abstract setHorario(
    medicoId: number,
    dto: {
      diaSemana: number;
      horaInicio: string;
      horaFin: string;
      horaInicioTarde?: string;
      horaFinTarde?: string;
      duracionSlotMinutos?: number;
      activo?: boolean;
    },
  ): Promise<HorarioMedicoDomain>;
  abstract deleteHorario(id: number): Promise<void>;
  abstract getSlotsDisponibles(
    medicoId: number,
    fecha: string,
  ): Promise<SlotDisponibleDto[]>;
  abstract bloquearFecha(
    medicoId: number,
    dto: {
      fechaInicio: string;
      fechaFin: string;
      horaInicio?: string;
      horaFin?: string;
      motivo: string;
    },
  ): Promise<BloqueoAgendaDomain>;
  abstract eliminarBloqueo(id: number): Promise<void>;
  abstract getBloqueos(medicoId: number): Promise<BloqueoAgendaDomain[]>;
  abstract getAgendaMedico(medicoId: number, fecha: string): Promise<any>;
}
