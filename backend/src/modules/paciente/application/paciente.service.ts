import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  PacienteRepositoryPort,
  PacienteQuery,
} from '../domain/ports/paciente-repository.port';
import { PacienteDomain, AlergiaInfo } from '../domain/paciente.domain';
import { PacienteDomainService } from '../domain/services/paciente-domain.service';
import { AuditService } from '../../../common/services/audit.service';
import { AuditAction } from '../../../entities/audit-log.entity';

export interface CreatePacienteDto {
  nombre: string;
  apellido: string;
  ci: string;
  fechaNacimiento: Date;
  generoId: number;
  telefono?: string;
  direccion?: string;
  email?: string;
  grupoSanguineoId?: number;
  sucursalId?: number;
  especialidad?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
}

export interface UpdatePacienteDto {
  nombre?: string;
  apellido?: string;
  ci?: string;
  fechaNacimiento?: Date;
  generoId?: number;
  telefono?: string;
  direccion?: string;
  email?: string;
  grupoSanguineoId?: number;
  estado?: string;
  especialidad?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
}

export interface AddAlergiaDto {
  alergiaId: number;
  severidad?: string;
}

@Injectable()
export class PacienteService {
  constructor(
    private readonly pacienteRepository: PacienteRepositoryPort,
    private readonly domainService: PacienteDomainService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: PacienteQuery) {
    return this.pacienteRepository.findAll(query);
  }

  async findOne(id: number): Promise<PacienteDomain> {
    const paciente = await this.pacienteRepository.findById(id);
    if (!paciente) throw new NotFoundException(`Paciente no encontrado`);
    return paciente;
  }

  async findByCi(ci: string): Promise<PacienteDomain> {
    const paciente = await this.pacienteRepository.findByCi(ci);
    if (!paciente)
      throw new NotFoundException(`Paciente con CI ${ci} no encontrado`);
    return paciente;
  }

  async buscarPacientes(query: string): Promise<PacienteDomain[]> {
    if (!query || query.length < 2) {
      throw new BadRequestException(
        'La búsqueda debe tener al menos 2 caracteres',
      );
    }
    return this.pacienteRepository.buscarPorTexto(query);
  }

  async create(
    dto: CreatePacienteDto,
    usuarioId: number,
  ): Promise<PacienteDomain> {
    const errores = this.domainService.validarCreacion(dto);
    if (errores.length > 0) throw new BadRequestException(errores.join('; '));

    const existe = await this.pacienteRepository.existsByCi(dto.ci);
    if (existe)
      throw new ConflictException(
        `Ya existe un paciente registrado con la cédula ${dto.ci}. Búsquelo en el padrón.`,
      );

    const paciente = new PacienteDomain({
      nombre: dto.nombre,
      apellido: dto.apellido,
      ci: dto.ci,
      fechaNacimiento: dto.fechaNacimiento,
      generoId: dto.generoId,
      telefono: dto.telefono,
      direccion: dto.direccion,
      email: dto.email,
      grupoSanguineoId: dto.grupoSanguineoId,
      usuarioRegistroId: usuarioId,
      sucursalId: dto.sucursalId,
      especialidad: dto.especialidad,
      contactoEmergenciaNombre: dto.contactoEmergenciaNombre,
      contactoEmergenciaTelefono: dto.contactoEmergenciaTelefono,
    });

    const saved = await this.pacienteRepository.save(paciente);
    this.auditService
      .log({
        userId: String(usuarioId),
        action: AuditAction.CREATE,
        entityType: 'paciente',
        entityId: String(saved.id),
        newValue: dto as any,
      })
      .catch(() => {});
    return saved;
  }

  async update(
    id: number,
    dto: UpdatePacienteDto,
    usuarioId?: number,
  ): Promise<PacienteDomain> {
    const paciente = await this.findOne(id);

    if (dto.ci && dto.ci !== paciente.ci) {
      const existe = await this.pacienteRepository.existsByCi(dto.ci, id);
      if (existe)
        throw new ConflictException(
          `Ya existe un paciente registrado con la cédula ${dto.ci}. Búsquelo en el padrón.`,
        );
    }

    const oldData = {
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      ci: paciente.ci,
    };
    if (dto.estado) {
      paciente.activo = dto.estado === 'activo';
    } else if (dto.estado === '') {
      paciente.activo = true;
    }
    paciente.actualizarDatos(dto);
    const saved = await this.pacienteRepository.save(paciente);
    this.auditService
      .log({
        userId: usuarioId ? String(usuarioId) : '0',
        action: AuditAction.UPDATE,
        entityType: 'paciente',
        entityId: String(id),
        oldValue: oldData,
        newValue: dto as any,
      })
      .catch(() => {});
    return saved;
  }

  async remove(id: number, usuarioId?: number): Promise<{ message: string }> {
    const paciente = await this.findOne(id);
    const oldData = {
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      ci: paciente.ci,
    };
    paciente.desactivar();
    await this.pacienteRepository.save(paciente);
    this.auditService
      .log({
        userId: usuarioId ? String(usuarioId) : '0',
        action: AuditAction.DELETE,
        entityType: 'paciente',
        entityId: String(id),
        oldValue: oldData,
      })
      .catch(() => {});
    return { message: 'Paciente eliminado exitosamente' };
  }

  async getHistoriaClinica(id: number): Promise<PacienteDomain> {
    const paciente = await this.pacienteRepository.findHistoriaClinica(id);
    if (!paciente)
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    return paciente;
  }

  async getPerfilCompleto(id: number): Promise<PacienteDomain> {
    const paciente = await this.pacienteRepository.findPerfilCompleto(id);
    if (!paciente)
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    return paciente;
  }

  async getAlergias(id: number): Promise<AlergiaInfo[]> {
    const paciente = await this.findOne(id);
    return paciente.alergias || [];
  }

  async addAlergia(
    pacienteId: number,
    dto: AddAlergiaDto,
  ): Promise<{ message: string }> {
    const paciente =
      await this.pacienteRepository.findHistoriaClinica(pacienteId);
    if (!paciente)
      throw new NotFoundException(
        `Paciente con ID ${pacienteId} no encontrado`,
      );

    const yaExiste = paciente.alergias.some((a) => a.id === dto.alergiaId);
    if (yaExiste)
      throw new ConflictException(
        'El paciente ya tiene registrada esta alergia',
      );

    await this.pacienteRepository.addAlergia(
      pacienteId,
      dto.alergiaId,
      dto.severidad,
    );

    return { message: 'Alergia agregada exitosamente' };
  }

  async getDiagnosticosCronicos(pacienteId: number) {
    await this.findOne(pacienteId);
    return [];
  }
}
