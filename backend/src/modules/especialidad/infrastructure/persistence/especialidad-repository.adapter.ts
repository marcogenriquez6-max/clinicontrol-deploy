import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EspecialidadRepositoryPort } from '../../domain/ports/especialidad-repository.port';
import { EspecialidadDomain } from '../../domain/especialidad.domain';
import { Especialidad } from '../../../../entities/especialidad.entity';

@Injectable()
export class EspecialidadRepositoryAdapter implements EspecialidadRepositoryPort {
  constructor(
    @InjectRepository(Especialidad)
    private readonly repo: Repository<Especialidad>,
  ) {}

  private toDomain(orm: Especialidad): EspecialidadDomain {
    return new EspecialidadDomain(orm.id, orm.nombre);
  }

  async findAll(): Promise<EspecialidadDomain[]> {
    const orms = await this.repo.find();
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<EspecialidadDomain | null> {
    const orm = await this.repo.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async create(data: Partial<EspecialidadDomain>): Promise<EspecialidadDomain> {
    const orm = this.repo.create(data as any);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved as any);
  }

  async update(
    id: number,
    data: Partial<EspecialidadDomain>,
  ): Promise<EspecialidadDomain> {
    await this.repo.update(id, data as any);
    return this.findById(id) as Promise<EspecialidadDomain>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
