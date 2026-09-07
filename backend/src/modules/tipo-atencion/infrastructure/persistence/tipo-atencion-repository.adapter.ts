import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoAtencionRepositoryPort } from '../../domain/ports/tipo-atencion-repository.port';
import { TipoAtencionDomain } from '../../domain/tipo-atencion.domain';
import { TipoAtencion } from '../../../../entities/tipo-atencion.entity';

@Injectable()
export class TipoAtencionRepositoryAdapter implements TipoAtencionRepositoryPort {
  constructor(
    @InjectRepository(TipoAtencion)
    private readonly repo: Repository<TipoAtencion>,
  ) {}

  private toDomain(orm: TipoAtencion): TipoAtencionDomain {
    return new TipoAtencionDomain(
      orm.id,
      orm.nombre,
      orm.tipo,
      orm.monto,
      orm.duracionMinutos,
      orm.activo,
    );
  }

  async findAll(): Promise<TipoAtencionDomain[]> {
    const orms = await this.repo.find({
      where: { activo: true } as any,
      order: { nombre: 'ASC' },
    });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<TipoAtencionDomain | null> {
    const orm = await this.repo.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async create(data: Partial<TipoAtencionDomain>): Promise<TipoAtencionDomain> {
    const orm = this.repo.create(data as any);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved as any);
  }

  async update(
    id: number,
    data: Partial<TipoAtencionDomain>,
  ): Promise<TipoAtencionDomain> {
    await this.repo.update(id, data as any);
    return this.findById(id) as Promise<TipoAtencionDomain>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
