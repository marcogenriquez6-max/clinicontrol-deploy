import { Injectable, NotFoundException } from '@nestjs/common';
import { DiagnosticoRepositoryPort } from '../domain/ports/diagnostico-repository.port';
import { DiagnosticoDomain } from '../domain/diagnostico.domain';
import {
  CreateDiagnosticoDto,
  UpdateDiagnosticoDto,
} from '../infrastructure/dto/create-diagnostico.dto';

@Injectable()
export class DiagnosticoService {
  constructor(private readonly diagnosticoRepo: DiagnosticoRepositoryPort) {}

  async findAll(): Promise<DiagnosticoDomain[]> {
    return this.diagnosticoRepo.findAll();
  }

  async findOne(id: number): Promise<DiagnosticoDomain> {
    const entity = await this.diagnosticoRepo.findById(id);
    if (!entity)
      throw new NotFoundException(`Diagnóstico con ID ${id} no encontrado`);
    return entity;
  }

  async findByConsulta(consultaId: number): Promise<DiagnosticoDomain[]> {
    return this.diagnosticoRepo.findByConsulta(consultaId);
  }

  async create(dto: CreateDiagnosticoDto): Promise<DiagnosticoDomain> {
    return this.diagnosticoRepo.create(dto as any);
  }

  async update(
    id: number,
    dto: UpdateDiagnosticoDto,
  ): Promise<DiagnosticoDomain> {
    await this.findOne(id);
    return this.diagnosticoRepo.update(id, dto as any);
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.diagnosticoRepo.delete(id);
  }

  async findCie10(query?: string) {
    return this.diagnosticoRepo.findCie10(query);
  }
}
