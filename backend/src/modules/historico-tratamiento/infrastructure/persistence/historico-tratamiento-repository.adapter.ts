import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoricoTratamientoRepositoryPort } from '../../domain/ports/historico-tratamiento-repository.port';
import { HistoricoTratamientoDomain } from '../../domain/historico-tratamiento.domain';
import { HistoricoTratamiento } from '../../../../entities/historico-tratamiento.entity';

@Injectable()
export class HistoricoTratamientoRepositoryAdapter implements HistoricoTratamientoRepositoryPort {
  constructor(
    @InjectRepository(HistoricoTratamiento)
    private readonly repo: Repository<HistoricoTratamiento>,
  ) {}

  private toDomain(orm: HistoricoTratamiento): HistoricoTratamientoDomain {
    return new HistoricoTratamientoDomain(
      orm.id,
      orm.pacienteId,
      orm.medicamentoId,
      orm.consultaId,
      orm.recetaId,
      orm.fechaInicio,
      orm.fechaFin,
      orm.dosis,
      orm.frecuencia,
      orm.viaAdministracionId,
      orm.estado,
      orm.motivoCambio,
      orm.medicoId,
      orm.observaciones,
    );
  }

  async findAll(): Promise<HistoricoTratamientoDomain[]> {
    const orms = await this.repo.find({ order: { createdAt: 'DESC' } });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<HistoricoTratamientoDomain | null> {
    const orm = await this.repo.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async create(
    data: Partial<HistoricoTratamientoDomain>,
  ): Promise<HistoricoTratamientoDomain> {
    const orm = this.repo.create(data as any);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved as any);
  }

  async update(
    id: number,
    data: Partial<HistoricoTratamientoDomain>,
  ): Promise<HistoricoTratamientoDomain> {
    await this.repo.update(id, data as any);
    return this.findById(id) as Promise<HistoricoTratamientoDomain>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async findByPaciente(
    pacienteId: number,
  ): Promise<HistoricoTratamientoDomain[]> {
    const orms = await this.repo.find({
      where: { pacienteId } as any,
      order: { fechaInicio: 'DESC' },
    });
    return orms.map((o) => this.toDomain(o));
  }

  async findActivos(pacienteId: number): Promise<HistoricoTratamientoDomain[]> {
    const orms = await this.repo.find({
      where: { pacienteId, estado: 'activo' } as any,
    });
    return orms.map((o) => this.toDomain(o));
  }
}
