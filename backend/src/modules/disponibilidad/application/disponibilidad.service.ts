import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { HorarioMedico } from '../../../entities/horario-medico.entity';
import { BloqueoAgenda } from '../../../entities/bloqueo-agenda.entity';
import { Cita } from '../../../entities/cita.entity';
import { Turno } from '../../../entities/turno.entity';
import { MedicoServicio } from '../../../entities/medico-servicio.entity';
import { Servicio } from '../../../entities/servicio.entity';

export interface SlotResult {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  estado: 'disponible' | 'ocupado' | 'bloqueado';
}

export interface ValidarContext {
  medicoId: number;
  servicioId?: number;
  fecha: Date | string;
  horaInicio: string;
  horaFin: string;
  excludeCitaId?: number;
  excludeTurnoId?: number;
  consultarTurnos?: boolean;
}

function toMinutes(h: string): number {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
}

function mmToHH(mm: number): string {
  const hh = String(Math.floor(mm / 60)).padStart(2, '0');
  const mi = String(mm % 60).padStart(2, '0');
  return `${hh}:${mi}`;
}

@Injectable()
export class DisponibilidadService {
  constructor(
    @InjectRepository(HorarioMedico)
    private readonly horarioRepo: Repository<HorarioMedico>,
    @InjectRepository(BloqueoAgenda)
    private readonly bloqueoRepo: Repository<BloqueoAgenda>,
    @InjectRepository(Cita)
    private readonly citaRepo: Repository<Cita>,
    @InjectRepository(Turno)
    private readonly turnoRepo: Repository<Turno>,
    @InjectRepository(MedicoServicio)
    private readonly medicoServicioRepo: Repository<MedicoServicio>,
    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,
  ) {}

  async verificarServicioHabilitado(
    medicoId: number,
    servicioId: number | undefined,
  ): Promise<void> {
    if (!servicioId) return;
    const existe = await this.medicoServicioRepo.findOne({
      where: { medicoId, servicioId, activo: true },
    });
    if (!existe) {
      throw new ConflictException(
        'El servicio seleccionado no está habilitado para este médico',
      );
    }
  }

  private fechaStr(fecha: Date | string): string {
    if (typeof fecha === 'string') return fecha.slice(0, 10);
    const d = new Date(fecha);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private fechaDate(fecha: Date | string): Date {
    if (typeof fecha === 'string') return new Date(fecha.slice(0, 10));
    return new Date(fecha);
  }

  async obtenerHorariosLaborales(medicoId: number, fecha: Date | string) {
    const date = this.fechaDate(fecha);
    const diaSemana = date.getDay();
    const horarios = await this.horarioRepo.find({
      where: { medicoId, diaSemana, activo: true },
    });
    if (horarios.length === 0) {
      throw new ConflictException(
        'El médico no trabaja este día de la semana',
      );
    }
    return horarios;
  }

  async verificarDiaLaborable(medicoId: number, fecha: Date | string) {
    await this.obtenerHorariosLaborales(medicoId, fecha);
  }

  private rangoDentroJornada(
    inicio: number,
    fin: number,
    horarios: HorarioMedico[],
  ): boolean {
    for (const h of horarios) {
      if (inicio >= toMinutes(h.horaInicio) && fin <= toMinutes(h.horaFin)) {
        return true;
      }
      if (h.horaInicioTarde && h.horaFinTarde) {
        if (
          inicio >= toMinutes(h.horaInicioTarde) &&
          fin <= toMinutes(h.horaFinTarde)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  async verificarDentroJornada(
    medicoId: number,
    fecha: Date | string,
    horaInicio: string,
    horaFin: string,
  ): Promise<void> {
    const horarios = await this.obtenerHorariosLaborales(medicoId, fecha);
    const inicio = toMinutes(horaInicio);
    const fin = toMinutes(horaFin);
    if (!this.rangoDentroJornada(inicio, fin, horarios)) {
      throw new ConflictException(
        'El horario solicitado no está dentro de la jornada laboral del médico',
      );
    }
  }

  async verificarBloqueo(
    medicoId: number,
    fecha: Date | string,
    horaInicio: string,
    horaFin: string,
  ): Promise<void> {
    const fechaStr = this.fechaStr(fecha);
    const bloqueos = await this.bloqueoRepo.find({
      where: {
        medicoId,
        fechaInicio: LessThanOrEqual(fechaStr),
        fechaFin: MoreThanOrEqual(fechaStr),
      },
    });
    for (const b of bloqueos) {
      if (!b.horaInicio || !b.horaFin) {
        throw new ConflictException(
          `El médico no está disponible esta fecha: ${b.motivo}`,
        );
      }
      // Cruce de rango
      if (
        toMinutes(horaInicio) < toMinutes(b.horaFin) &&
        toMinutes(horaFin) > toMinutes(b.horaInicio)
      ) {
        throw new ConflictException(
          `El horario coincide con una ausencia del médico: ${b.motivo}`,
        );
      }
    }
  }

  async verificarCruceCitas(
    medicoId: number,
    fecha: Date | string,
    horaInicio: string,
    horaFin: string,
    excludeCitaId?: number,
  ): Promise<void> {
    const fechaDate = this.fechaDate(fecha);
    const qb = this.citaRepo
      .createQueryBuilder('cita')
      .innerJoin('cita.estado', 'estado')
      .where('cita.medicoId = :medicoId', { medicoId })
      .andWhere('cita.fecha = :fecha', { fecha: fechaDate })
      .andWhere('cita.horaInicio < :horaFin AND cita.horaFin > :horaInicio', {
        horaInicio,
        horaFin,
      })
      .andWhere('estado.nombre NOT IN (:...excluded)', {
        excluded: ['cancelada', 'no_asistio', 'reprogramada'],
      });
    if (excludeCitaId) {
      qb.andWhere('cita.id != :excludeCitaId', { excludeCitaId });
    }
    const data = await qb.getMany();
    if (data.length > 0) {
      const c = data[0];
      throw new ConflictException(
        `El médico ya tiene una cita de ${c.horaInicio} a ${c.horaFin}. Elija otro horario.`,
      );
    }
  }

  async verificarCruceTurnos(
    medicoId: number,
    fecha: Date | string,
    horaInicio: string,
    horaFin: string,
    excludeTurnoId?: number,
    fechaProgramada?: string,
  ): Promise<void> {
    const fp = fechaProgramada ?? this.fechaStr(fecha);
    const qb = this.turnoRepo
      .createQueryBuilder('turno')
      .where('turno.medicoId = :medicoId', { medicoId })
      .andWhere('turno.fecha_programada = :fp', { fp })
      .andWhere('turno.hora_programada < :horaFin', { horaFin })
      .andWhere('COALESCE(turno.hora_programada, \'\') != \'\'')
      .andWhere('turno.hora_programada IS NOT NULL')
      .andWhere('turno.estado NOT IN (:...excluded)', {
        excluded: ['cancelado', 'completado'],
      });
    if (excludeTurnoId) {
      qb.andWhere('turno.id != :excludeTurnoId', { excludeTurnoId });
    }
    // Ajustar overlap por duración del turno: usamos la hora fin calculada a partir del servicio
    const data = await qb.getMany();
    for (const t of data) {
      const hTurno = t.horaProgramada;
      if (!hTurno) continue;
      const tInicio = toMinutes(hTurno);
      const tFin = tInicio + 30;
      if (
        toMinutes(horaInicio) < tFin &&
        toMinutes(horaFin) > tInicio
      ) {
        throw new ConflictException(
          `El médico ya tiene un turno a las ${hTurno}. Elija otro horario.`,
        );
      }
    }
  }

  async obtenerDuracionServicio(servicioId?: number, tipoAtencionId?: number, horaFin?: string, horaInicio?: string): Promise<number> {
    if (servicioId) {
      const s = await this.servicioRepo.findOne({
        where: { id: servicioId },
      });
      if (s && s.duracionMinutos) return s.duracionMinutos;
    }
    return 30;
  }

  async calcularHoraFin(
    horaInicio: string,
    servicioId?: number,
  ): Promise<string> {
    const duracion = await this.obtenerDuracionServicio(servicioId);
    return mmToHH(toMinutes(horaInicio) + duracion);
  }

  /**
   * Valida la cadena completa de disponibilidad.
   */
  async validarDisponibilidad(ctx: ValidarContext): Promise<void> {
    await this.verificarDiaLaborable(ctx.medicoId, ctx.fecha);
    await this.verificarServicioHabilitado(ctx.medicoId, ctx.servicioId);
    await this.verificarDentroJornada(
      ctx.medicoId,
      ctx.fecha,
      ctx.horaInicio,
      ctx.horaFin,
    );
    await this.verificarBloqueo(
      ctx.medicoId,
      ctx.fecha,
      ctx.horaInicio,
      ctx.horaFin,
    );
    await this.verificarCruceCitas(
      ctx.medicoId,
      ctx.fecha,
      ctx.horaInicio,
      ctx.horaFin,
      ctx.excludeCitaId,
    );
    await this.verificarCruceTurnos(
      ctx.medicoId,
      ctx.fecha,
      ctx.horaInicio,
      ctx.horaFin,
      ctx.excludeTurnoId,
    );
  }

  /**
   * Genera slots disponibles para un médico, servicio y fecha,
   * respetando jornada, duración del servicio, citas y bloqueos.
   */
  async getSlots(
    medicoId: number,
    fecha: Date | string,
    servicioId?: number,
  ): Promise<SlotResult[]> {
    await this.verificarDiaLaborable(medicoId, fecha);
    const horarios = await this.obtenerHorariosLaborales(medicoId, fecha);
    const duracion = await this.obtenerDuracionServicio(servicioId);
    const fechaStr = this.fechaStr(fecha);
    const fechaDate = this.fechaDate(fecha);

    const citas = await this.citaRepo
      .createQueryBuilder('cita')
      .innerJoin('cita.estado', 'estado')
      .where('cita.medicoId = :medicoId', { medicoId })
      .andWhere('cita.fecha = :fecha', { fecha: fechaDate })
      .andWhere('estado.nombre NOT IN (:...excluded)', {
        excluded: ['cancelada', 'no_asistio', 'reprogramada'],
      })
      .getMany();

    const turnos = await this.turnoRepo
      .createQueryBuilder('turno')
      .where('turno.medicoId = :medicoId', { medicoId })
      .andWhere('turno.fecha_programada = :fp', { fp: fechaStr })
      .andWhere('turno.hora_programada IS NOT NULL')
      .andWhere('turno.estado NOT IN (:...excluded)', {
        excluded: ['cancelado', 'completado'],
      })
      .getMany();

    const bloqueos = await this.bloqueoRepo.find({
      where: {
        medicoId,
        fechaInicio: LessThanOrEqual(fechaStr),
        fechaFin: MoreThanOrEqual(fechaStr),
      },
    });

    const citasOcupadas: Array<[number, number]> = citas.map((c) => [
      toMinutes(c.horaInicio),
      toMinutes(c.horaFin),
    ]);
    const turnosOcupados: Array<[number, number]> = turnos.flatMap((t) => {
      const hp = t.horaProgramada;
      if (!hp) return [];
      return [[toMinutes(hp), toMinutes(hp) + 30]] as Array<[number, number]>;
    });

    const bloquesOcupados: Array<[number, number] | null> = bloqueos.map((b) =>
      b.horaInicio && b.horaFin
        ? [toMinutes(b.horaInicio), toMinutes(b.horaFin)]
        : null,
    );

    const slots: SlotResult[] = [];
    for (const h of horarios) {
      const rangos: Array<[number, number]> = [];
      rangos.push([toMinutes(h.horaInicio), toMinutes(h.horaFin)]);
      if (h.horaInicioTarde && h.horaFinTarde) {
        rangos.push([
          toMinutes(h.horaInicioTarde),
          toMinutes(h.horaFinTarde),
        ]);
      }
      for (const [inicio, fin] of rangos) {
        let actual = inicio;
        while (actual + duracion <= fin) {
          const sInicio = actual;
          const sFin = actual + duracion;
          const bloqueado = bloquesOcupados.some((b) =>
            b
              ? sInicio < b[1] && sFin > b[0]
              : true,
          );
          const ocupadoCita = citasOcupadas.some(
            (o) => sInicio < o[1] && sFin > o[0],
          );
          const ocupadoTurno = turnosOcupados.some(
            (o) => sInicio < o[1] && sFin > o[0],
          );
          const estado = bloqueado
            ? 'bloqueado'
            : ocupadoCita || ocupadoTurno
              ? 'ocupado'
              : 'disponible';
          slots.push({
            horaInicio: mmToHH(sInicio),
            horaFin: mmToHH(sFin),
            disponible: estado === 'disponible',
            estado,
          });
          actual += duracion;
        }
      }
    }
    return slots;
  }
}
