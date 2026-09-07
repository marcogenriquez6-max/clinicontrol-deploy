import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoCitaRepositoryPort } from '../../domain/ports/estado-cita-repository.port';
import { EstadoCitaDomain } from '../../domain/estado-cita.domain';
import { EstadoCita } from '../../../../entities/estado-cita.entity';

@Injectable()
export class EstadoCitaRepositoryAdapter implements EstadoCitaRepositoryPort {
  constructor(
    @InjectRepository(EstadoCita)
    private readonly repo: Repository<EstadoCita>,
  ) {}

  private toDomain(orm: EstadoCita): EstadoCitaDomain {
    return new EstadoCitaDomain(orm.id, orm.nombre);
  }

  async findAll(): Promise<EstadoCitaDomain[]> {
    const orms = await this.repo.find();
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<EstadoCitaDomain | null> {
    const orm = await this.repo.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async create(data: Partial<EstadoCitaDomain>): Promise<EstadoCitaDomain> {
    const orm = this.repo.create(data as any);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved as any);
  }

  async update(
    id: number,
    data: Partial<EstadoCitaDomain>,
  ): Promise<EstadoCitaDomain> {
    await this.repo.update(id, data as any);
    return this.findById(id) as Promise<EstadoCitaDomain>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
