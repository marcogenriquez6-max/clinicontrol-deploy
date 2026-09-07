import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SucursalRepositoryPort } from '../../domain/ports/sucursal-repository.port';
import { SucursalDomain } from '../../domain/sucursal.domain';
import { Sucursal } from '../../../../entities/sucursal.entity';

@Injectable()
export class SucursalRepositoryAdapter implements SucursalRepositoryPort {
  constructor(
    @InjectRepository(Sucursal)
    private readonly repo: Repository<Sucursal>,
  ) {}

  private toDomain(orm: Sucursal): SucursalDomain {
    return new SucursalDomain(
      orm.id,
      orm.nombre,
      orm.direccion,
      orm.telefono,
      orm.email,
      orm.rnc,
      orm.activo,
    );
  }

  async findAll(): Promise<SucursalDomain[]> {
    const orms = await this.repo.find({ where: { activo: true } as any });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<SucursalDomain | null> {
    const orm = await this.repo.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async create(data: Partial<SucursalDomain>): Promise<SucursalDomain> {
    const orm = this.repo.create(data as any);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved as any);
  }

  async update(
    id: number,
    data: Partial<SucursalDomain>,
  ): Promise<SucursalDomain> {
    await this.repo.update(id, data as any);
    return this.findById(id) as Promise<SucursalDomain>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
