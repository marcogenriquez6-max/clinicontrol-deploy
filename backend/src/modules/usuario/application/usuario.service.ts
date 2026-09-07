import { ILike } from 'typeorm';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsuarioRepositoryPort } from '../domain/ports/usuario-repository.port';
import { UsuarioDomain } from '../domain/usuario.domain';
import {
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from '../infrastructure/dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(private readonly usuarioRepo: UsuarioRepositoryPort) {}

  private toDomain(orm: any): UsuarioDomain {
    return new UsuarioDomain(
      orm.id,
      orm.nombre,
      orm.apellido,
      orm.ci,
      orm.email,
      orm.password,
      orm.rolId,
      orm.bloqueado,
      orm.bloqueado_motivo,
      orm.intentos_fallidos,
      orm.ultimo_login ?? undefined,
      orm.mfa_secret,
      orm.mfa_enabled,
      orm.mfa_method,
    );
  }

  async findAll(filters?: { nombre?: string; ci?: string; activo?: boolean }): Promise<UsuarioDomain[]> {
    const where: any = {};
    if (filters?.nombre) {
      where.nombre = ILike(`%${filters.nombre}%`);
    }
    if (filters?.ci) {
      where.ci = filters.ci;
    }
    if (filters?.activo !== undefined) {
      where.activo = filters.activo;
    }
    const orms = await this.usuarioRepo.find(where, ['rol']);
    return orms.map((o) => this.toDomain(o));
  }

  async findOne(id: number): Promise<UsuarioDomain> {
    const usuario = await this.usuarioRepo.findById(id);
    if (!usuario)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return usuario;
  }

  async findByEmail(email: string): Promise<UsuarioDomain | null> {
    return this.usuarioRepo.findByEmail(email);
  }

  async search(filters: { nombre?: string; ci?: string }): Promise<UsuarioDomain[]> {
    return this.findAll({ nombre: filters.nombre, ci: filters.ci });
  }

  async create(dto: CreateUsuarioDto): Promise<UsuarioDomain> {
    const existing = await this.usuarioRepo.findByEmail(dto.email);
    if (existing) throw new ConflictException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const saved = await this.usuarioRepo.create({
      ...dto,
      password: hashedPassword,
      rolId: dto.rolId || 3,
    });
    return saved;
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<UsuarioDomain> {
    await this.findOne(id);

    if (dto.email) {
      const existing = await this.usuarioRepo.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 12);
    }

    return this.usuarioRepo.update(id, dto as any);
  }

  async cambiarRol(id: number, rolId: number): Promise<UsuarioDomain> {
    await this.findOne(id);
    return this.usuarioRepo.update(id, { rolId } as any);
  }

  async cambiarEstado(
    id: number,
    activo: boolean,
    currentUserId: number,
  ): Promise<UsuarioDomain> {
    if (id === currentUserId && !activo) {
      throw new BadRequestException(
        'No puede desactivar su propia cuenta',
      );
    }
    await this.findOne(id);
    return this.usuarioRepo.update(id, { activo } as any);
  }

  async delete(id: number): Promise<void> {
    const usuario = await this.usuarioRepo.findById(id);
    if (!usuario)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    await this.usuarioRepo.delete(id);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return this.usuarioRepo.validatePassword(plainPassword, hashedPassword);
  }
}
