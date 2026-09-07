import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneroRepositoryPort } from '../../domain/ports/genero-repository.port';
import { GeneroDomain } from '../../domain/genero.domain';
import { Genero } from '../../../../entities/genero.entity';

@Injectable()
export class GeneroRepositoryAdapter implements GeneroRepositoryPort {
  constructor(
    @InjectRepository(Genero)
    private readonly repo: Repository<Genero>,
  ) {}

  private toDomain(orm: Genero): GeneroDomain {
    return new GeneroDomain(orm.id, orm.nombre);
  }

  async findAll(): Promise<GeneroDomain[]> {
    const orms = await this.repo.find();
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<GeneroDomain | null> {
    const orm = await this.repo.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async create(data: Partial<GeneroDomain>): Promise<GeneroDomain> {
    const orm = this.repo.create(data as any);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved as any);
  }

  async update(id: number, data: Partial<GeneroDomain>): Promise<GeneroDomain> {
    await this.repo.update(id, data as any);
    return this.findById(id) as Promise<GeneroDomain>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
