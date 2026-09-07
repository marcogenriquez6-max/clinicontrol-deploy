import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArqueoRepositoryPort } from '../../domain/ports/arqueo-repository.port';
import { ArqueoDomain } from '../../domain/arqueo.domain';
import { ArqueoCaja } from '../../../../entities/arqueo-caja.entity';

@Injectable()
export class ArqueoRepositoryAdapter implements ArqueoRepositoryPort {
  constructor(
    @InjectRepository(ArqueoCaja)
    private readonly repo: Repository<ArqueoCaja>,
  ) {}

  private toDomain(orm: ArqueoCaja): ArqueoDomain {
    return new ArqueoDomain(
      orm.id,
      orm.fecha,
      orm.montoEsperado,
      orm.montoReal,
      orm.diferencia,
      orm.observaciones,
      orm.usuarioId,
      orm.cajaSessionId,
      orm.createdAt,
    );
  }

  async findById(id: number): Promise<ArqueoDomain | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(order: 'ASC' | 'DESC' = 'DESC'): Promise<ArqueoDomain[]> {
    const orms = await this.repo.find({ order: { fecha: order } });
    return orms.map((o) => this.toDomain(o));
  }

  async create(data: Partial<ArqueoDomain>): Promise<ArqueoDomain> {
    const orm = this.repo.create(data as any);
    const saved = (await this.repo.save(orm as any)) as ArqueoCaja;
    return this.toDomain(saved);
  }
}
