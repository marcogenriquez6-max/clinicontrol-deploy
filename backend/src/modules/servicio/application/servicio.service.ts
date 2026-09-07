import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ServicioRepositoryPort } from '../domain/ports/servicio-repository.port';
import { ServicioDomain } from '../domain/servicio.domain';
import {
  CreateServicioDto,
  UpdateServicioDto,
  ServicioQuery,
} from '../infrastructure/dto/create-servicio.dto';

@Injectable()
export class ServicioService {
  constructor(private readonly servicioRepo: ServicioRepositoryPort) {}

  async findAll(query: ServicioQuery) {
    return this.servicioRepo.findAll(query);
  }

  async findById(id: number): Promise<ServicioDomain> {
    const servicio = await this.servicioRepo.findById(id);
    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }
    return servicio;
  }

  async findByEspecialidad(especialidadId: number): Promise<ServicioDomain[]> {
    return this.servicioRepo.findByEspecialidad(especialidadId);
  }

  async findByMedico(medicoId: number): Promise<ServicioDomain[]> {
    return this.servicioRepo.findByMedico(medicoId);
  }

  async create(dto: CreateServicioDto): Promise<ServicioDomain> {
    // Validar que no exista un servicio con el mismo nombre en la misma especialidad
    const existing = await this.servicioRepo.findByEspecialidad(dto.especialidadId);
    const nombreNormalizado = dto.nombre.trim().toLowerCase();
    const duplicado = existing.find(
      (s) => s.nombre?.trim().toLowerCase() === nombreNormalizado,
    );
    if (duplicado) {
      throw new ConflictException(
        `Ya existe un servicio "${dto.nombre}" en esta especialidad`,
      );
    }

    const domain = new ServicioDomain(
      undefined,
      dto.nombre.trim(),
      dto.descripcion?.trim(),
      dto.especialidadId,
      dto.duracionMinutos,
      dto.monto,
      true,
      dto.requierePreparacion,
      dto.preparacionInstrucciones?.trim(),
    );
    return this.servicioRepo.save(domain);
  }

  async update(id: number, dto: UpdateServicioDto): Promise<ServicioDomain> {
    await this.findById(id);

    if (dto.nombre) {
      // Validar nombre único en la especialidad
      const current = await this.findById(id);
      const especialidadId = dto.especialidadId ?? current.especialidadId;
      if (especialidadId === undefined) {
        throw new BadRequestException('La especialidad es requerida para validar nombre único');
      }
      const existing = await this.servicioRepo.findByEspecialidad(especialidadId);
      const nombreNormalizado = dto.nombre.trim().toLowerCase();
      const duplicado = existing.find(
        (s) => s.id !== id && s.nombre?.trim().toLowerCase() === nombreNormalizado,
      );
      if (duplicado) {
        throw new ConflictException(
          `Ya existe un servicio "${dto.nombre}" en esta especialidad`,
        );
      }
    }

    return this.servicioRepo.update(id, dto as any);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.servicioRepo.remove(id);
  }
}