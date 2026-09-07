import { Injectable, NotFoundException } from '@nestjs/common';
import { GrupoSanguineoRepositoryPort } from '../domain/ports/grupo-sanguineo-repository.port';
import { GrupoSanguineoDomain } from '../domain/grupo-sanguineo.domain';

@Injectable()
export class GrupoSanguineoService {
  constructor(
    private readonly grupoSanguineoRepo: GrupoSanguineoRepositoryPort,
  ) {}

  async findAll(): Promise<GrupoSanguineoDomain[]> {
    return this.grupoSanguineoRepo.findAll();
  }

  async findOne(id: number): Promise<GrupoSanguineoDomain> {
    const entity = await this.grupoSanguineoRepo.findById(id);
    if (!entity)
      throw new NotFoundException(`Grupo sanguíneo con ID ${id} no encontrado`);
    return entity;
  }
}
