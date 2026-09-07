import { Injectable, NotFoundException } from '@nestjs/common';
import { GeneroRepositoryPort } from '../domain/ports/genero-repository.port';
import { GeneroDomain } from '../domain/genero.domain';

@Injectable()
export class GeneroService {
  constructor(private readonly generoRepo: GeneroRepositoryPort) {}

  async findAll(): Promise<GeneroDomain[]> {
    return this.generoRepo.findAll();
  }

  async findOne(id: number): Promise<GeneroDomain> {
    const entity = await this.generoRepo.findById(id);
    if (!entity)
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    return entity;
  }
}
