import { Injectable, NotFoundException } from '@nestjs/common';
import { SucursalRepositoryPort } from '../domain/ports/sucursal-repository.port';
import { SucursalDomain } from '../domain/sucursal.domain';
import {
  CreateSucursalDto,
  UpdateSucursalDto,
} from '../infrastructure/dto/create-sucursal.dto';

@Injectable()
export class SucursalService {
  constructor(private readonly sucursalRepo: SucursalRepositoryPort) {}

  async findAll(): Promise<SucursalDomain[]> {
    return this.sucursalRepo.findAll();
  }

  async findOne(id: number): Promise<SucursalDomain> {
    const entity = await this.sucursalRepo.findById(id);
    if (!entity)
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    return entity;
  }

  async create(dto: CreateSucursalDto): Promise<SucursalDomain> {
    return this.sucursalRepo.create(dto as any);
  }

  async update(id: number, dto: UpdateSucursalDto): Promise<SucursalDomain> {
    await this.findOne(id);
    return this.sucursalRepo.update(id, dto as any);
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.sucursalRepo.delete(id);
  }
}
