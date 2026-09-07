import { Injectable, NotFoundException } from '@nestjs/common';
import { RolRepositoryPort } from '../domain/ports/rol-repository.port';
import { RolDomain } from '../domain/rol.domain';
import {
  CreateRolDto,
  UpdateRolDto,
} from '../infrastructure/dto/create-rol.dto';

@Injectable()
export class RolService {
  constructor(private readonly rolRepo: RolRepositoryPort) {}

  async findAll(): Promise<RolDomain[]> {
    return this.rolRepo.findAll();
  }

  async findOne(id: number): Promise<RolDomain> {
    const entity = await this.rolRepo.findById(id);
    if (!entity) throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    return entity;
  }

  async create(dto: CreateRolDto): Promise<RolDomain> {
    return this.rolRepo.create(dto as any);
  }

  async update(id: number, dto: UpdateRolDto): Promise<RolDomain> {
    await this.findOne(id);
    return this.rolRepo.update(id, dto as any);
  }
}
