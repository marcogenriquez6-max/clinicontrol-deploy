import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicioRepositoryPort } from '../../domain/ports/servicio-repository.port';
import { ServicioDomain } from '../../domain/servicio.domain';
import { Servicio } from '../../../../entities/servicio.entity';
import { ServicioQuery } from '../../domain/ports/servicio-repository.port';

@Injectable()
export class ServicioRepositoryAdapter implements ServicioRepositoryPort {
  constructor(
    @InjectRepository(Servicio)
    private readonly repo: Repository<Servicio>,
  ) {}

  private toDomain(orm: Servicio): ServicioDomain {
    return new ServicioDomain(
      orm.id,
      orm.nombre,
      orm.descripcion,
      orm.especialidadId,
      orm.duracionMinutos,
      orm.monto,
      orm.activo,
      orm.requierePreparacion,
      orm.preparacionInstrucciones,
    );
  }

  async findAll(query: ServicioQuery) {
    const { especialidadId, activo, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (especialidadId) where.especialidadId = especialidadId;
    if (activo !== undefined) where.activo = activo;

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['especialidad'],
      skip,
      take: limit,
      order: { nombre: 'ASC' },
    });

    return {
      data: data.map((o) => this.toDomain(o)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number): Promise<ServicioDomain | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: ['especialidad'],
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findByEspecialidad(especialidadId: number): Promise<ServicioDomain[]> {
    const data = await this.repo.find({
      where: { especialidadId, activo: true },
      order: { nombre: 'ASC' },
    });
    return data.map((o) => this.toDomain(o));
  }

  async findByMedico(medicoId: number): Promise<ServicioDomain[]> {
    const data = await this.repo
      .createQueryBuilder('servicio')
      .innerJoin('medico_servicio', 'ms', 'ms.servicio_id = servicio.id')
      .where('ms.medico_id = :medicoId', { medicoId })
      .andWhere('ms.activo = :activo', { activo: true })
      .andWhere('servicio.activo = :activo', { activo: true })
      .orderBy('servicio.nombre', 'ASC')
      .getMany();
    return data.map((o) => this.toDomain(o));
  }

  async save(servicio: ServicioDomain): Promise<ServicioDomain> {
    const orm = this.repo.create({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      especialidadId: servicio.especialidadId,
      duracionMinutos: servicio.duracionMinutos,
      monto: servicio.monto,
      activo: servicio.activo,
      requierePreparacion: servicio.requierePreparacion,
      preparacionInstrucciones: servicio.preparacionInstrucciones,
    });
    const saved = await this.repo.save(orm);
    return this.findById(saved.id) as Promise<ServicioDomain>;
  }

  async update(id: number, data: Partial<ServicioDomain>): Promise<ServicioDomain> {
    const orm = await this.repo.findOne({ where: { id } });
    if (!orm) throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    Object.assign(orm, data);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }
  }
}