import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicoRepositoryPort } from '../domain/ports/medico-repository.port';
import { MedicoDomain } from '../domain/medico.domain';
import {
  CreateMedicoDto,
  UpdateMedicoDto,
} from '../infrastructure/dto/create-medico.dto';
import { Usuario } from '../../../entities/usuario.entity';
import { MedicoServicio } from '../../../entities/medico-servicio.entity';

@Injectable()
export class MedicoService {
  constructor(
    private readonly medicoRepo: MedicoRepositoryPort,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(MedicoServicio)
    private readonly medicoServicioRepo: Repository<MedicoServicio>,
  ) {}

  async findAll(): Promise<MedicoDomain[]> {
    return this.medicoRepo.findAll();
  }

  async findOne(id: number): Promise<MedicoDomain> {
    const entity = await this.medicoRepo.findById(id);
    if (!entity)
      throw new NotFoundException(`Médico con ID ${id} no encontrado`);
    return entity;
  }

  async findByEspecialidad(especialidadId: number): Promise<MedicoDomain[]> {
    return this.medicoRepo.findByEspecialidad(especialidadId);
  }

  async create(dto: CreateMedicoDto): Promise<MedicoDomain> {
    return this.medicoRepo.create(dto as any);
  }

  async update(id: number, dto: UpdateMedicoDto): Promise<MedicoDomain> {
    await this.findOne(id);
    return this.medicoRepo.update(id, dto as any);
  }

  async vincularUsuario(id: number, usuarioId: number): Promise<MedicoDomain> {
    await this.findOne(id);

    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const medicoConUsuario = await this.medicoRepo.findByUsuarioId(usuarioId);
    if (medicoConUsuario && medicoConUsuario.id !== id) {
      throw new ConflictException(
        `El usuario ${usuarioId} ya está vinculado a otro médico`,
      );
    }

    return this.medicoRepo.update(id, { usuarioId } as any);
  }

  async delete(id: number): Promise<void> {
    const entity = await this.medicoRepo.findById(id);
    if (!entity)
      throw new NotFoundException(`Médico con ID ${id} no encontrado`);
    await this.medicoRepo.delete(id);
  }

  // ── CRUD Servicios por Médico ──

  async getServiciosByMedico(medicoId: number): Promise<MedicoServicio[]> {
    await this.findOne(medicoId);
    return this.medicoServicioRepo.find({
      where: { medicoId },
      relations: ['servicio'],
    });
  }

  async assignServicio(medicoId: number, servicioId: number): Promise<MedicoServicio> {
    await this.findOne(medicoId);
    const existing = await this.medicoServicioRepo.findOne({ where: { medicoId, servicioId } });
    if (existing) {
      if (!existing.activo) {
        existing.activo = true;
        return this.medicoServicioRepo.save(existing);
      }
      throw new ConflictException('El médico ya tiene asignado este servicio');
    }
    return this.medicoServicioRepo.save(this.medicoServicioRepo.create({ medicoId, servicioId, activo: true }));
  }

  async removeServicio(medicoId: number, servicioId: number): Promise<void> {
    const ms = await this.medicoServicioRepo.findOne({ where: { medicoId, servicioId } });
    if (!ms) throw new NotFoundException('Asignación médico-servicio no encontrada');
    await this.medicoServicioRepo.remove(ms);
  }
}
