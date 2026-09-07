import { Injectable, NotFoundException } from '@nestjs/common';
import { CirugiaPreviaRepositoryPort } from '../domain/ports/cirugia-previa-repository.port';
import { CirugiaPreviaDomain } from '../domain/cirugia-previa.domain';
import { CreateCirugiaPreviaDto } from '../infrastructure/dto/create-cirugia-previa.dto';

@Injectable()
export class CirugiaPreviaService {
  constructor(
    private readonly cirugiaPreviaRepo: CirugiaPreviaRepositoryPort,
  ) {}

  async findByPaciente(pacienteId: number): Promise<CirugiaPreviaDomain[]> {
    return this.cirugiaPreviaRepo.findByPaciente(pacienteId);
  }

  async create(dto: CreateCirugiaPreviaDto): Promise<CirugiaPreviaDomain> {
    return this.cirugiaPreviaRepo.create(dto as any);
  }

  async update(
    id: number,
    dto: Partial<CreateCirugiaPreviaDto>,
  ): Promise<CirugiaPreviaDomain> {
    const entity = await this.cirugiaPreviaRepo.findById(id);
    if (!entity)
      throw new NotFoundException(`Cirugía previa con ID ${id} no encontrada`);
    return this.cirugiaPreviaRepo.update(id, dto as any);
  }

  async delete(id: number): Promise<void> {
    const entity = await this.cirugiaPreviaRepo.findById(id);
    if (!entity)
      throw new NotFoundException(`Cirugía previa con ID ${id} no encontrada`);
    await this.cirugiaPreviaRepo.delete(id);
  }
}
