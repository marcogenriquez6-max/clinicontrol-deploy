import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { HospitalizacionRepositoryPort } from '../domain/ports/hospitalizacion-repository.port';
import {
  HospitalizacionDomain,
  CamaDomain,
  BedStatus,
  AdmisionEstado,
} from '../domain/hospitalizacion.domain';
import {
  CreateHospitalizacionDto,
  UpdateHospitalizacionDto,
  DarAltaDto,
  CreateCamaDto,
  UpdateCamaDto,
  CreateNotaEvolucionHospitalizacionDto,
  HospitalizacionQueryDto,
} from '../infrastructure/dto/create-hospitalizacion.dto';

@Injectable()
export class HospitalizacionService {
  constructor(private readonly hospRepo: HospitalizacionRepositoryPort) {}

  async create(
    dto: CreateHospitalizacionDto,
    usuarioId: number,
  ): Promise<HospitalizacionDomain> {
    return this.hospRepo.create(dto as any, usuarioId);
  }

  async findAll(query: HospitalizacionQueryDto) {
    return this.hospRepo.findAll(query);
  }

  async findOne(id: number): Promise<HospitalizacionDomain> {
    const hosp = await this.hospRepo.findById(id);
    if (!hosp)
      throw new NotFoundException(`Hospitalización ${id} no encontrada`);
    return hosp;
  }

  async update(
    id: number,
    dto: UpdateHospitalizacionDto,
  ): Promise<HospitalizacionDomain> {
    await this.findOne(id);
    return this.hospRepo.update(id, dto as any);
  }

  async darAlta(id: number, dto: DarAltaDto): Promise<HospitalizacionDomain> {
    return this.hospRepo.darAlta(id, dto);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.hospRepo.softDelete(id);
    return { message: 'Hospitalización eliminada exitosamente' };
  }

  async createCama(dto: CreateCamaDto): Promise<CamaDomain> {
    return this.hospRepo.createCama(dto as any);
  }

  async findAllCamas(servicio?: string) {
    return this.hospRepo.findAllCamas(servicio);
  }

  async findCama(id: number): Promise<CamaDomain> {
    const cama = await this.hospRepo.findCamaById(id);
    if (!cama) throw new NotFoundException(`Cama ${id} no encontrada`);
    return cama;
  }

  async updateCama(id: number, dto: UpdateCamaDto): Promise<CamaDomain> {
    await this.findCama(id);
    return this.hospRepo.updateCama(id, dto as any);
  }

  async removeCama(id: number): Promise<{ message: string }> {
    await this.findCama(id);
    await this.hospRepo.removeCama(id);
    return { message: 'Cama eliminada exitosamente' };
  }

  async createNotaEvolucion(
    hospId: number,
    dto: CreateNotaEvolucionHospitalizacionDto,
    usuarioId: number,
  ) {
    return this.hospRepo.createNotaEvolucion(hospId, dto, usuarioId);
  }

  async findNotasEvolucion(hospId: number) {
    return this.hospRepo.findNotasEvolucion(hospId);
  }

  async getCamasDisponibles(servicio?: string) {
    return this.hospRepo.getCamasDisponibles(servicio);
  }

  async getStats() {
    return this.hospRepo.getStats();
  }
}
