import { Injectable, NotFoundException } from '@nestjs/common';
import { HistoricoTratamientoRepositoryPort } from '../domain/ports/historico-tratamiento-repository.port';
import { HistoricoTratamientoDomain } from '../domain/historico-tratamiento.domain';
import { CreateHistoricoTratamientoDto } from '../infrastructure/dto/create-historico-tratamiento.dto';

@Injectable()
export class HistoricoTratamientoService {
  constructor(
    private readonly historicoTratamientoRepo: HistoricoTratamientoRepositoryPort,
  ) {}

  async findAll(): Promise<HistoricoTratamientoDomain[]> {
    return this.historicoTratamientoRepo.findAll();
  }

  async findOne(id: number): Promise<HistoricoTratamientoDomain> {
    const entity = await this.historicoTratamientoRepo.findById(id);
    if (!entity)
      throw new NotFoundException('Registro de tratamiento no encontrado');
    return entity;
  }

  async findByPaciente(
    pacienteId: number,
  ): Promise<HistoricoTratamientoDomain[]> {
    return this.historicoTratamientoRepo.findByPaciente(pacienteId);
  }

  async findActivos(pacienteId: number): Promise<HistoricoTratamientoDomain[]> {
    return this.historicoTratamientoRepo.findActivos(pacienteId);
  }

  async create(
    dto: CreateHistoricoTratamientoDto,
  ): Promise<HistoricoTratamientoDomain> {
    return this.historicoTratamientoRepo.create(dto as any);
  }

  async updateEstado(
    id: number,
    estado: string,
    motivoCambio?: string,
  ): Promise<HistoricoTratamientoDomain> {
    const record = await this.findOne(id);
    const updateData: any = { estado };
    if (motivoCambio !== undefined) updateData.motivoCambio = motivoCambio;
    if (estado !== 'activo')
      updateData.fechaFin = new Date().toISOString().split('T')[0];
    return this.historicoTratamientoRepo.update(id, updateData);
  }

  async getTimeline(pacienteId: number): Promise<HistoricoTratamientoDomain[]> {
    return this.historicoTratamientoRepo.findByPaciente(pacienteId);
  }

  async registrarCambio(
    oldRecordId: number,
    newDto: CreateHistoricoTratamientoDto,
    motivoCambio: string,
  ): Promise<HistoricoTratamientoDomain> {
    await this.updateEstado(oldRecordId, 'cambiado', motivoCambio);
    return this.create({ ...newDto, motivoCambio });
  }
}
