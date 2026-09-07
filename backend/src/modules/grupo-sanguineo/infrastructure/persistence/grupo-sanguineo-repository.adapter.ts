import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrupoSanguineoRepositoryPort } from '../../domain/ports/grupo-sanguineo-repository.port';
import { GrupoSanguineoDomain } from '../../domain/grupo-sanguineo.domain';
import { GrupoSanguineo } from '../../../../entities/grupo-sanguineo.entity';

@Injectable()
export class GrupoSanguineoRepositoryAdapter implements GrupoSanguineoRepositoryPort {
  constructor(
    @InjectRepository(GrupoSanguineo)
    private readonly repo: Repository<GrupoSanguineo>,
  ) {}

  private toDomain(orm: GrupoSanguineo): GrupoSanguineoDomain {
    return new GrupoSanguineoDomain(orm.id, orm.nombre);
  }

  async findAll(): Promise<GrupoSanguineoDomain[]> {
    const orms = await this.repo.find();
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<GrupoSanguineoDomain | null> {
    const orm = await this.repo.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async create(
    data: Partial<GrupoSanguineoDomain>,
  ): Promise<GrupoSanguineoDomain> {
    const orm = this.repo.create(data as any);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved as any);
  }

  async update(
    id: number,
    data: Partial<GrupoSanguineoDomain>,
  ): Promise<GrupoSanguineoDomain> {
    await this.repo.update(id, data as any);
    return this.findById(id) as Promise<GrupoSanguineoDomain>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
