import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticoRepositoryPort } from '../../domain/ports/diagnostico-repository.port';
import {
  DiagnosticoDomain,
  Cie10Domain,
} from '../../domain/diagnostico.domain';
import { Diagnostico } from '../../../../entities/diagnostico.entity';
import { Cie10 } from '../../../../entities/cie10.entity';

@Injectable()
export class DiagnosticoRepositoryAdapter implements DiagnosticoRepositoryPort {
  constructor(
    @InjectRepository(Diagnostico)
    private readonly diagnosticoRepository: Repository<Diagnostico>,
    @InjectRepository(Cie10)
    private readonly cie10Repository: Repository<Cie10>,
  ) {}

  private toDomain(orm: Diagnostico): DiagnosticoDomain {
    return new DiagnosticoDomain(
      orm.id,
      orm.consultaId,
      orm.cie10Id,
      orm.codigo,
      orm.descripcion,
      orm.tipo,
      orm.recomendaciones,
      orm.esCronico,
      orm.createdAt,
    );
  }

  private cie10ToDomain(orm: Cie10): Cie10Domain {
    return new Cie10Domain(orm.id, orm.codigo, orm.descripcion);
  }

  async findAll(): Promise<DiagnosticoDomain[]> {
    const orms = await this.diagnosticoRepository.find({
      relations: ['consulta', 'cie10'],
    });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<DiagnosticoDomain | null> {
    const orm = await this.diagnosticoRepository.findOne({
      where: { id },
      relations: ['consulta', 'cie10'],
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByConsulta(consultaId: number): Promise<DiagnosticoDomain[]> {
    const orms = await this.diagnosticoRepository.find({
      where: { consultaId },
      relations: ['cie10'],
    });
    return orms.map((o) => this.toDomain(o));
  }

  async create(data: Partial<DiagnosticoDomain>): Promise<DiagnosticoDomain> {
    const orm = this.diagnosticoRepository.create(data as any);
    const saved = await this.diagnosticoRepository.save(orm);
    return this.toDomain(saved as any);
  }

  async update(
    id: number,
    data: Partial<DiagnosticoDomain>,
  ): Promise<DiagnosticoDomain> {
    const orm = await this.diagnosticoRepository.findOne({ where: { id } });
    if (!orm)
      throw new NotFoundException(`Diagnóstico con ID ${id} no encontrado`);
    Object.assign(orm, data);
    const saved = await this.diagnosticoRepository.save(orm);
    return this.toDomain(saved as any);
  }

  async delete(id: number): Promise<void> {
    const result = await this.diagnosticoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Diagnóstico con ID ${id} no encontrado`);
    }
  }

  async findCie10(query?: string): Promise<Cie10Domain[]> {
    if (query) {
      const orms = await this.cie10Repository
        .createQueryBuilder('cie10')
        .where('LOWER(cie10.codigo) LIKE LOWER(:query)', {
          query: `%${query}%`,
        })
        .orWhere('LOWER(cie10.descripcion) LIKE LOWER(:query)', {
          query: `%${query}%`,
        })
        .limit(20)
        .getMany();
      return orms.map((o) => this.cie10ToDomain(o));
    }
    const orms = await this.cie10Repository.find({ take: 20 });
    return orms.map((o) => this.cie10ToDomain(o));
  }
}
