import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlergiaRepositoryPort } from '../../domain/ports/alergia-repository.port';
import { AlergiaDomain } from '../../domain/alergia.domain';
import { Alergia } from '../../../../entities/alergia.entity';

@Injectable()
export class AlergiaRepositoryAdapter implements AlergiaRepositoryPort {
  constructor(
    @InjectRepository(Alergia)
    private readonly repo: Repository<Alergia>,
  ) {}

  private toDomain(orm: Alergia): AlergiaDomain {
    return new AlergiaDomain(
      orm.id,
      orm.nombre,
      orm.descripcion,
      orm.severidad,
    );
  }

  async findAll(): Promise<AlergiaDomain[]> {
    const orms = await this.repo.find({ order: { nombre: 'ASC' } });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<AlergiaDomain | null> {
    const orm = await this.repo.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async create(data: Partial<AlergiaDomain>): Promise<AlergiaDomain> {
    const orm = this.repo.create(data as any);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved as any);
  }

  async update(
    id: number,
    data: Partial<AlergiaDomain>,
  ): Promise<AlergiaDomain> {
    await this.repo.update(id, data as any);
    return this.findById(id) as Promise<AlergiaDomain>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async search(query: string): Promise<AlergiaDomain[]> {
    const orms = await this.repo
      .createQueryBuilder('alergia')
      .where('LOWER(alergia.nombre) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orWhere('LOWER(alergia.descripcion) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orderBy('alergia.nombre', 'ASC')
      .limit(20)
      .getMany();
    return orms.map((o) => this.toDomain(o));
  }
}
