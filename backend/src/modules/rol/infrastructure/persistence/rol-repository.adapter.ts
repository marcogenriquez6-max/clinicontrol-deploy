import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolRepositoryPort } from '../../domain/ports/rol-repository.port';
import { RolDomain } from '../../domain/rol.domain';
import { Rol } from '../../../../entities/rol.entity';

@Injectable()
export class RolRepositoryAdapter implements RolRepositoryPort {
  constructor(
    @InjectRepository(Rol)
    private readonly repo: Repository<Rol>,
  ) {}

  private toDomain(orm: Rol): RolDomain {
    return new RolDomain(orm.id, orm.nombre);
  }

  async findAll(): Promise<RolDomain[]> {
    const orms = await this.repo.find();
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<RolDomain | null> {
    const orm = await this.repo.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async create(data: Partial<RolDomain>): Promise<RolDomain> {
    const orm = this.repo.create(data as any);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved as any);
  }

  async update(id: number, data: Partial<RolDomain>): Promise<RolDomain> {
    await this.repo.update(id, data as any);
    return this.findById(id) as Promise<RolDomain>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
