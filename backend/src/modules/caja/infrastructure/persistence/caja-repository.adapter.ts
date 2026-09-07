import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CajaRepositoryPort } from '../../domain/ports/caja-repository.port';
import { CajaSessionDomain } from '../../domain/caja.domain';
import { CajaSession } from '../../../../entities/caja.entity';

@Injectable()
export class CajaRepositoryAdapter implements CajaRepositoryPort {
  constructor(
    @InjectRepository(CajaSession)
    private readonly repo: Repository<CajaSession>,
  ) {}

  private toDomain(orm: CajaSession): CajaSessionDomain {
    return new CajaSessionDomain(
      orm.id,
      orm.fechaApertura,
      Number(orm.montoInicial),
      orm.estado as any,
      orm.usuarioId,
      orm.fechaCierre,
      orm.montoFinal ? Number(orm.montoFinal) : undefined,
      orm.observaciones,
      orm.createdAt,
    );
  }

  async findById(id: number): Promise<CajaSessionDomain | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findSesionAbierta(): Promise<CajaSessionDomain | null> {
    const orm = await this.repo.findOne({ where: { estado: 'abierta' } });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(order: 'ASC' | 'DESC' = 'DESC'): Promise<CajaSessionDomain[]> {
    const orms = await this.repo.find({ order: { fechaApertura: order } });
    return orms.map((o) => this.toDomain(o));
  }

  async create(data: Partial<CajaSessionDomain>): Promise<CajaSessionDomain> {
    const orm = this.repo.create(data as any);
    const saved = (await this.repo.save(orm as any)) as CajaSession;
    return this.toDomain(saved);
  }

  async update(id: number, data: Partial<CajaSessionDomain>): Promise<void> {
    await this.repo.update(id, data as any);
  }
}
