import { Injectable, NotFoundException } from '@nestjs/common';
import { TipoAtencionRepositoryPort } from '../domain/ports/tipo-atencion-repository.port';
import { TipoAtencionDomain } from '../domain/tipo-atencion.domain';
import {
  CreateTipoAtencionDto,
  UpdateTipoAtencionDto,
} from '../infrastructure/dto/create-tipo-atencion.dto';

@Injectable()
export class TipoAtencionService {
  constructor(private readonly tipoAtencionRepo: TipoAtencionRepositoryPort) {}

  async findAll(): Promise<TipoAtencionDomain[]> {
    return this.tipoAtencionRepo.findAll();
  }

  async findOne(id: number): Promise<TipoAtencionDomain> {
    const entity = await this.tipoAtencionRepo.findById(id);
    if (!entity)
      throw new NotFoundException(
        `Tipo de atención con ID ${id} no encontrado`,
      );
    return entity;
  }

  async create(dto: CreateTipoAtencionDto): Promise<TipoAtencionDomain> {
    return this.tipoAtencionRepo.create(dto as any);
  }

  async update(
    id: number,
    dto: UpdateTipoAtencionDto,
  ): Promise<TipoAtencionDomain> {
    await this.findOne(id);
    return this.tipoAtencionRepo.update(id, dto as any);
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.tipoAtencionRepo.delete(id);
  }
}
