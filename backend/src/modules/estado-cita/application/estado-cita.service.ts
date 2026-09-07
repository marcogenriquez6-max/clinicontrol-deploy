import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoCitaRepositoryPort } from '../domain/ports/estado-cita-repository.port';
import { EstadoCitaDomain } from '../domain/estado-cita.domain';

@Injectable()
export class EstadoCitaService {
  constructor(private readonly estadoCitaRepo: EstadoCitaRepositoryPort) {}

  async findAll(): Promise<EstadoCitaDomain[]> {
    return this.estadoCitaRepo.findAll();
  }

  async findOne(id: number): Promise<EstadoCitaDomain> {
    const entity = await this.estadoCitaRepo.findById(id);
    if (!entity)
      throw new NotFoundException(`Estado de cita con ID ${id} no encontrado`);
    return entity;
  }
}
