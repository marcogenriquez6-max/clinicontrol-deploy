import { Injectable, NotFoundException } from '@nestjs/common';
import { AlergiaRepositoryPort } from '../domain/ports/alergia-repository.port';
import { AlergiaDomain } from '../domain/alergia.domain';
import {
  CreateAlergiaDto,
  UpdateAlergiaDto,
} from '../infrastructure/dto/create-alergia.dto';

@Injectable()
export class AlergiaService {
  constructor(private readonly alergiaRepo: AlergiaRepositoryPort) {}

  async findAll(): Promise<AlergiaDomain[]> {
    return this.alergiaRepo.findAll();
  }

  async findOne(id: number): Promise<AlergiaDomain> {
    const entity = await this.alergiaRepo.findById(id);
    if (!entity)
      throw new NotFoundException(`Alergia con ID ${id} no encontrada`);
    return entity;
  }

  async search(query: string): Promise<AlergiaDomain[]> {
    return this.alergiaRepo.search(query);
  }

  async create(dto: CreateAlergiaDto): Promise<AlergiaDomain> {
    return this.alergiaRepo.create(dto as any);
  }

  async update(id: number, dto: UpdateAlergiaDto): Promise<AlergiaDomain> {
    await this.findOne(id);
    return this.alergiaRepo.update(id, dto as any);
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.alergiaRepo.delete(id);
  }
}
