import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AgendaRepositoryPort } from '../domain/ports/agenda-repository.port';
import { SlotDisponibleDto } from '../domain/agenda.domain';
import {
  CreateHorarioMedicoDto,
  BloquearFechaDto,
} from '../infrastructure/dto/horario-medico.dto';

@Injectable()
export class AgendaService {
  constructor(private readonly agendaRepo: AgendaRepositoryPort) {}

  async getHorarios(medicoId: number) {
    return this.agendaRepo.getHorarios(medicoId);
  }

  async setHorario(medicoId: number, dto: CreateHorarioMedicoDto) {
    if (dto.horaFin <= dto.horaInicio) {
      throw new BadRequestException(
        'hora_fin debe ser posterior a hora_inicio',
      );
    }
    return this.agendaRepo.setHorario(medicoId, dto);
  }

  async deleteHorario(id: number): Promise<void> {
    await this.agendaRepo.deleteHorario(id);
  }

  async getSlotsDisponibles(
    medicoId: number,
    fecha: string,
  ): Promise<SlotDisponibleDto[]> {
    return this.agendaRepo.getSlotsDisponibles(medicoId, fecha);
  }

  async bloquearFecha(medicoId: number, dto: BloquearFechaDto) {
    return this.agendaRepo.bloquearFecha(medicoId, dto);
  }

  async eliminarBloqueo(id: number): Promise<void> {
    await this.agendaRepo.eliminarBloqueo(id);
  }

  async getBloqueos(medicoId: number) {
    return this.agendaRepo.getBloqueos(medicoId);
  }

  async getAgendaMedico(medicoId: number, fecha: string) {
    return this.agendaRepo.getAgendaMedico(medicoId, fecha);
  }
}
