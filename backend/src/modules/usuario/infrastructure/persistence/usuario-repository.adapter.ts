import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario-repository.port';
import { UsuarioDomain } from '../../domain/usuario.domain';
import { Usuario } from '../../../../entities/usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioRepositoryAdapter implements UsuarioRepositoryPort {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  private toDomain(orm: Usuario): UsuarioDomain {
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

  async find(
    where: any,
    relations?: string[],
  ): Promise<UsuarioDomain[]> {
    const orms = await this.repo.find({
      where,
      relations,
      select: [
        'id',
        'nombre',
        'apellido',
        'email',
        'ci',
        'rolId',
        'createdAt',
        'password',
        'mfa_secret',
        'bloqueado',
        'bloqueado_motivo',
        'intentos_fallidos',
        'ultimo_login',
        'mfa_enabled',
        'mfa_method',
      ],
    });
    return orms.map((o) => this.toDomain(o));
  }

  async findAll(): Promise<UsuarioDomain[]> {
    const orms = await this.repo.find({
      relations: ['rol'],
      select: ['id', 'nombre', 'apellido', 'email', 'rolId', 'createdAt'],
    });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<UsuarioDomain | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: ['rol'],
      select: [
        'id',
        'nombre',
        'apellido',
        'email',
        'ci',
        'rolId',
        'createdAt',
        'password',
        'mfa_secret',
        'bloqueado',
        'bloqueado_motivo',
        'intentos_fallidos',
        'ultimo_login',
        'mfa_enabled',
        'mfa_method',
      ],
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByEmail(email: string): Promise<UsuarioDomain | null> {
    const orm = await this.repo.findOne({
      where: { email },
      relations: ['rol'],
    });
    return orm ? this.toDomain(orm) : null;
  }

  async create(data: Partial<UsuarioDomain>): Promise<UsuarioDomain> {
    const orm = this.repo.create(data as any);
    const saved = await this.repo.save(orm);
    const { password: _pw, mfa_secret: _ms, ...safeUser } = saved as any;
    void _pw;
    void _ms;
    return this.toDomain({ ...safeUser } as Usuario);
  }

  async update(
    id: number,
    data: Partial<UsuarioDomain>,
  ): Promise<UsuarioDomain> {
    const orm = await this.repo.findOne({ where: { id } });
    if (!orm) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    Object.assign(orm, data);
    const saved = await this.repo.save(orm);
    const { password: _pw, mfa_secret: _ms, ...safeUser } = saved as any;
    void _pw;
    void _ms;
    return this.toDomain({ ...safeUser } as Usuario);
  }

  async delete(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
