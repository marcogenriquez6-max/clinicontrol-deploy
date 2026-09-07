import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AgendaRepositoryPort } from '../../domain/ports/agenda-repository.port';
import {
  HorarioMedicoDomain,
  BloqueoAgendaDomain,
  SlotDisponibleDto,
} from '../../domain/agenda.domain';
import { HorarioMedico } from '../../../../entities/horario-medico.entity';
import { BloqueoAgenda } from '../../../../entities/bloqueo-agenda.entity';
import { Cita } from '../../../../entities/cita.entity';

@Injectable()
export class AgendaRepositoryAdapter implements AgendaRepositoryPort {
  constructor(
    @InjectRepository(HorarioMedico)
    private readonly horarioRepo: Repository<HorarioMedico>,
    @InjectRepository(BloqueoAgenda)
    private readonly bloqueoRepo: Repository<BloqueoAgenda>,
    @InjectRepository(Cita)
    private readonly citaRepo: Repository<Cita>,
  ) {}

  private horarioToDomain(orm: HorarioMedico): HorarioMedicoDomain {
    return new HorarioMedicoDomain(
      orm.id,
      orm.medicoId,
      orm.diaSemana,
      orm.horaInicio,
      orm.horaFin,
      orm.horaInicioTarde,
      orm.horaFinTarde,
      orm.duracionSlotMinutos,
      orm.activo,
    );
  }

  private bloqueoToDomain(orm: BloqueoAgenda): BloqueoAgendaDomain {
    return new BloqueoAgendaDomain(
      orm.id,
      orm.medicoId,
      orm.fechaInicio,
      orm.fechaFin,
      orm.horaInicio,
      orm.horaFin,
      orm.motivo,
      orm.tipo,
    );
  }

  async getHorarios(medicoId: number): Promise<HorarioMedicoDomain[]> {
    const orms = await this.horarioRepo.find({
      where: { medicoId },
      order: { diaSemana: 'ASC', horaInicio: 'ASC' },
    });
    return orms.map((o) => this.horarioToDomain(o));
  }

  async setHorario(
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
  ): Promise<HorarioMedicoDomain> {
    const existing = await this.horarioRepo.findOne({
      where: { medicoId, diaSemana: dto.diaSemana, horaInicio: dto.horaInicio },
    });

    if (existing) {
      Object.assign(existing, dto);
      const saved = await this.horarioRepo.save(existing);
      return this.horarioToDomain(saved as any);
    }

    const horario = this.horarioRepo.create({ medicoId, ...dto });
    const saved = await this.horarioRepo.save(horario);
    return this.horarioToDomain(saved as any);
  }

  async deleteHorario(id: number): Promise<void> {
    const result = await this.horarioRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }
  }

  async getSlotsDisponibles(
    medicoId: number,
    fecha: string,
  ): Promise<SlotDisponibleDto[]> {
    const date = new Date(fecha);
    const diaSemana = date.getDay();

    const horarios = await this.horarioRepo.find({
      where: { medicoId, diaSemana, activo: true },
    });

    if (horarios.length === 0) return [];

    const citas = await this.citaRepo.find({
      where: { medicoId, fecha: date },
      relations: ['estado'],
    });

    const citasNoCancelables = citas.filter((c) => {
      const codigo = (c as any).estado?.codigo;
      return codigo !== 'cancelada' && codigo !== 'no_asistio';
    });

    const bloqueos = await this.bloqueoRepo.find({
      where: [
        {
          medicoId,
          fechaInicio: LessThanOrEqual(fecha),
          fechaFin: MoreThanOrEqual(fecha),
        },
      ],
    });

    const slots: SlotDisponibleDto[] = [];

    for (const horario of horarios) {
      const manianaSlots = this.generarSlots(
        horario.horaInicio,
        horario.horaFin,
        horario.duracionSlotMinutos,
      );
      slots.push(...manianaSlots);

      if (horario.horaInicioTarde && horario.horaFinTarde) {
        const tardeSlots = this.generarSlots(
          horario.horaInicioTarde,
          horario.horaFinTarde,
          horario.duracionSlotMinutos,
        );
        slots.push(...tardeSlots);
      }
    }

    return slots.map((slot) => {
      const ocupado = citasNoCancelables.some(
        (c) => c.horaInicio === slot.horaInicio,
      );
      const bloqueado = bloqueos.some((b) => {
        if (b.horaInicio && b.horaFin) {
          return slot.horaInicio >= b.horaInicio && slot.horaFin <= b.horaFin;
        }
        return true;
      });

      if (bloqueado) return { ...slot, disponible: false, estado: 'bloqueado' };
      if (ocupado) return { ...slot, disponible: false, estado: 'ocupado' };
      return { ...slot, disponible: true, estado: 'disponible' };
    });
  }

  private generarSlots(
    inicio: string,
    fin: string,
    duracion: number,
  ): SlotDisponibleDto[] {
    const slots: SlotDisponibleDto[] = [];
    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);

    let minutosActuales = hInicio * 60 + mInicio;
    const minutosFin = hFin * 60 + mFin;

    while (minutosActuales + duracion <= minutosFin) {
      const hh = String(Math.floor(minutosActuales / 60)).padStart(2, '0');
      const mm = String(minutosActuales % 60).padStart(2, '0');
      const hhFin = String(
        Math.floor((minutosActuales + duracion) / 60),
      ).padStart(2, '0');
      const mmFin = String((minutosActuales + duracion) % 60).padStart(2, '0');

      slots.push({
        horaInicio: `${hh}:${mm}`,
        horaFin: `${hhFin}:${mmFin}`,
        disponible: true,
      });
      minutosActuales += duracion;
    }

    return slots;
  }

  async bloquearFecha(
    medicoId: number,
    dto: {
      fechaInicio: string;
      fechaFin: string;
      horaInicio?: string;
      horaFin?: string;
      motivo: string;
    },
  ): Promise<BloqueoAgendaDomain> {
    const bloqueo = this.bloqueoRepo.create({ medicoId, ...dto });
    const saved = await this.bloqueoRepo.save(bloqueo);
    return this.bloqueoToDomain(saved as any);
  }

  async eliminarBloqueo(id: number): Promise<void> {
    const result = await this.bloqueoRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Bloqueo con ID ${id} no encontrado`);
    }
  }

  async getBloqueos(medicoId: number): Promise<BloqueoAgendaDomain[]> {
    const orms = await this.bloqueoRepo.find({
      where: { medicoId },
      order: { fechaInicio: 'DESC' },
    });
    return orms.map((o) => this.bloqueoToDomain(o));
  }

  async getAgendaMedico(medicoId: number, fecha: string): Promise<any> {
    const horarios = await this.getHorarios(medicoId);
    const slots = await this.getSlotsDisponibles(medicoId, fecha);

    const citas = await this.citaRepo.find({
      where: { medicoId, fecha: new Date(fecha) },
      relations: ['paciente', 'estado'],
      order: { horaInicio: 'ASC' },
    });

    return { medicoId, fecha, horarios, slots, citas };
  }
}
