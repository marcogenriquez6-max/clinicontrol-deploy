import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, MoreThanOrEqual, LessThan } from 'typeorm';
import { CitaRepositoryPort } from '../../domain/ports/cita-repository.port';
import { CitaDomain } from '../../domain/cita.domain';
import { Cita } from '../../../../entities/cita.entity';
import { EstadoCita } from '../../../../entities/estado-cita.entity';

@Injectable()
export class CitaRepositoryAdapter implements CitaRepositoryPort {
  constructor(
    @InjectRepository(Cita)
    private readonly repo: Repository<Cita>,
    @InjectRepository(EstadoCita)
    private readonly estadoRepo: Repository<EstadoCita>,
  ) {}

  private toDomain(orm: Cita): CitaDomain {
    return new CitaDomain(
      orm.pacienteId,
      orm.medicoId,
      orm.fecha,
      orm.horaInicio,
      orm.horaFin,
      orm.id,
      (orm.estado?.nombre
        ?.toLowerCase()
        .replace(/\s+/g, '_') as CitaDomain['estado']) ?? 'pendiente',
      orm.esVirtual,
      orm.motivo,
      orm.sucursalId,
      orm.observaciones,
      orm.creadoPorId,
      orm.cancelacionMotivo,
      orm.canceladoPorId,
      orm.especialidadId,
      orm.servicioId,
      orm.tipoAtencionId,
    );
  }

  async findAll(query: {
    pacienteId?: number;
    medicoId?: number;
    fecha?: string;
    estadoId?: number;
    page?: number;
    limit?: number;
  }) {
    const {
      pacienteId,
      medicoId,
      fecha,
      estadoId,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (pacienteId) where.paciente = { id: pacienteId };
    if (medicoId) where.medico = { id: medicoId };
    if (fecha) where.fecha = new Date(fecha);
    if (estadoId) where.estado = { id: estadoId };

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: [
        'paciente',
        'medico',
        'medico.especialidad',
        'estado',
        'especialidad',
        'servicio',
        'tipoAtencion',
      ],
      skip,
      take: limit,
      order: { fecha: 'ASC', horaInicio: 'ASC' },
    });

    return {
      data: data.map((o) => this.toDomain(o)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number): Promise<CitaDomain | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: [
        'paciente',
        'medico',
        'medico.especialidad',
        'estado',
        'especialidad',
        'servicio',
        'tipoAtencion',
      ],
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findConflicts(
    medicoId: number,
    fecha: Date,
    horaInicio: string,
    horaFin: string,
    excludeId?: number,
  ): Promise<{
    hasConflict: boolean;
    conflictingCita?: CitaDomain;
    medicoNombre?: string;
  }> {
    const qb = this.repo
      .createQueryBuilder('cita')
      .innerJoin('cita.estado', 'estado')
      .innerJoin('cita.medico', 'medico')
      .where('cita.medicoId = :medicoId', { medicoId })
      .andWhere('cita.fecha = :fecha', { fecha })
      .andWhere('cita.horaInicio < :horaFin AND cita.horaFin > :horaInicio', {
        horaInicio,
        horaFin,
      })
      .andWhere('estado.nombre NOT IN (:...excludedEstados)', {
        excludedEstados: ['cancelada', 'no_asistio'],
      });

    if (excludeId) {
      qb.andWhere('cita.id != :excludeId', { excludeId });
    }

    const [data] = await qb.take(1).getManyAndCount();
    const hasConflict = data.length > 0;

    let conflictingCita: CitaDomain | undefined;
    let medicoNombre: string | undefined;
    if (hasConflict && data[0]) {
      conflictingCita = this.toDomain(data[0]) as CitaDomain;
      medicoNombre = data[0].medico?.nombre;
    }

    return { hasConflict, conflictingCita, medicoNombre };
  }

  async findDisponibilidad(medicoId: number, fecha: Date) {
    const citas = await this.repo.find({
      where: {
        medico: { id: medicoId },
        fecha,
      },
      relations: ['estado'],
      order: { horaInicio: 'ASC' },
    });

    return citas.map((c) => ({
      horaInicio: c.horaInicio,
      horaFin: c.horaFin,
      estado:
        c.estado?.nombre?.toLowerCase().replace(/\s+/g, '_') ?? 'pendiente',
    }));
  }

  async save(cita: CitaDomain): Promise<CitaDomain> {
    if (cita.id) {
      const ormData: Partial<Cita> = {
        fecha: cita.fecha,
        horaInicio: cita.horaInicio,
        horaFin: cita.horaFin,
        esVirtual: cita.esVirtual,
        motivo: cita.motivo,
        sucursalId: cita.sucursalId,
        observaciones: cita.observaciones,
        cancelacionMotivo: cita.cancelacionMotivo,
        canceladoPorId: cita.canceladoPorId,
        especialidadId: cita.especialidadId,
        servicioId: cita.servicioId,
        tipoAtencionId: cita.tipoAtencionId,
      };

      if (cita.estado) {
        const estado = await this.estadoRepo.findOne({
          where: {
            nombre: cita.estado
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase()),
          },
        });
        if (estado) ormData.estado = { id: estado.id } as any;
      }

      await this.repo.update(cita.id, ormData as any);
      return this.findById(cita.id) as Promise<CitaDomain>;
    }

    const estadoNombre = cita.estado
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const estado = await this.estadoRepo.findOne({
      where: { nombre: estadoNombre },
    });

    const orm = this.repo.create({
      pacienteId: cita.pacienteId,
      medicoId: cita.medicoId,
      fecha: cita.fecha,
      horaInicio: cita.horaInicio,
      horaFin: cita.horaFin,
      esVirtual: cita.esVirtual,
      motivo: cita.motivo,
      sucursalId: cita.sucursalId,
      observaciones: cita.observaciones,
      creadoPorId: cita.creadoPorId,
      especialidadId: cita.especialidadId,
      servicioId: cita.servicioId,
      tipoAtencionId: cita.tipoAtencionId,
      estado: { id: estado?.id ?? 1 } as any,
    });

    const saved = await this.repo.save(orm);
    return this.findById(saved.id) as Promise<CitaDomain>;
  }

  async update(id: number, data: Partial<CitaDomain>): Promise<CitaDomain> {
    const ormData: Partial<Cita> = {};
    if (data.fecha !== undefined) ormData.fecha = data.fecha;
    if (data.horaInicio !== undefined) ormData.horaInicio = data.horaInicio;
    if (data.horaFin !== undefined) ormData.horaFin = data.horaFin;
    if (data.motivo !== undefined) ormData.motivo = data.motivo;
    if (data.observaciones !== undefined)
      ormData.observaciones = data.observaciones;
    if (data.esVirtual !== undefined) ormData.esVirtual = data.esVirtual;
    if (data.sucursalId !== undefined) ormData.sucursalId = data.sucursalId;
    if (data.cancelacionMotivo !== undefined)
      ormData.cancelacionMotivo = data.cancelacionMotivo;
    if (data.canceladoPorId !== undefined)
      ormData.canceladoPorId = data.canceladoPorId;
    await this.repo.update(id, ormData as any);
    return this.findById(id) as Promise<CitaDomain>;
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }
  }

  async findEstadoCanceladaId(): Promise<number> {
    const estado = await this.estadoRepo.findOne({
      where: { nombre: 'Cancelada' },
    });
    return estado?.id ?? 5;
  }
}
