import { Injectable, NotFoundException } from '@nestjs/common';
import { EspecialidadRepositoryPort } from '../domain/ports/especialidad-repository.port';
import { EspecialidadDomain } from '../domain/especialidad.domain';
import {
  CreateEspecialidadDto,
  UpdateEspecialidadDto,
} from '../infrastructure/dto/create-especialidad.dto';

@Injectable()
export class EspecialidadService {
  constructor(private readonly especialidadRepo: EspecialidadRepositoryPort) {}

  async findAll(): Promise<EspecialidadDomain[]> {
    return this.especialidadRepo.findAll();
  }

  async findOne(id: number): Promise<EspecialidadDomain> {
    const entity = await this.especialidadRepo.findById(id);
    if (!entity)
      throw new NotFoundException(`Especialidad con ID ${id} no encontrada`);
    return entity;
  }

  async create(dto: CreateEspecialidadDto): Promise<EspecialidadDomain> {
    return this.especialidadRepo.create(dto as any);
  }

  async update(
    id: number,
    dto: UpdateEspecialidadDto,
  ): Promise<EspecialidadDomain> {
    await this.findOne(id);
    return this.especialidadRepo.update(id, dto as any);
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.especialidadRepo.delete(id);
  }
}
