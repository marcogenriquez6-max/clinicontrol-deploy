import { Injectable, NotFoundException } from '@nestjs/common';
import { ArqueoRepositoryPort } from '../domain/ports/arqueo-repository.port';
import { ArqueoDomain } from '../domain/arqueo.domain';

@Injectable()
export class ArqueoService {
  constructor(private readonly arqueoRepo: ArqueoRepositoryPort) {}

  async findAll(): Promise<ArqueoDomain[]> {
    return this.arqueoRepo.findAll('DESC');
  }

  async findOne(id: number): Promise<ArqueoDomain> {
    const arqueo = await this.arqueoRepo.findById(id);
    if (!arqueo) throw new NotFoundException(`Arqueo ${id} no encontrado`);
    return arqueo;
  }

  async crear(data: {
    montoEsperado: number;
    montoReal: number;
    observaciones?: string;
    usuarioId?: number;
    cajaSessionId?: number;
  }): Promise<ArqueoDomain> {
    const diferencia = data.montoReal - data.montoEsperado;
    return this.arqueoRepo.create({
      fecha: new Date(),
      montoEsperado: data.montoEsperado,
      montoReal: data.montoReal,
      diferencia,
      observaciones: data.observaciones,
      usuarioId: data.usuarioId,
      cajaSessionId: data.cajaSessionId,
    });
  }
}
