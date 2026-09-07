import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { UserDomain } from '../../domain/user.domain';
import { Usuario } from '../../../../entities/usuario.entity';
import { Rol } from '../../../../entities/rol.entity';

@Injectable()
export class AuthRepositoryAdapter implements AuthRepositoryPort {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) {}

  private toDomain(orm: Usuario): UserDomain {
    const domain = new UserDomain({
      id: orm.id,
      nombre: orm.nombre,
      apellido: orm.apellido,
      email: orm.email,
      ci: orm.ci,
      password: orm.password,
      rolId: orm.rolId,
      rolNombre: orm.rol?.nombre,
    });
    domain.bloqueado = orm.bloqueado;
    domain.bloqueadoMotivo = orm.bloqueado_motivo;
    domain.intentosFallidos = orm.intentos_fallidos;
    domain.ultimoLogin = orm.ultimo_login ?? undefined;
    domain.mfaEnabled = orm.mfa_enabled;
    domain.mfaSecret = orm.mfa_secret;
    domain.mfaMethod = orm.mfa_method;
    domain.createdAt = orm.createdAt;
    return domain;
  }

  async findByEmail(email: string): Promise<UserDomain | null> {
    const orm = await this.repo.findOne({
      where: { email },
      relations: ['rol'],
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findById(id: number): Promise<UserDomain | null> {
    const orm = await this.repo.findOne({ where: { id }, relations: ['rol'] });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findByCi(ci: string): Promise<UserDomain | null> {
    const orm = await this.repo.findOne({ where: { ci }, relations: ['rol'] });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async save(user: UserDomain): Promise<UserDomain> {
    const ormData: Partial<Usuario> = {
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      ci: user.ci,
      password: user.password,
      rolId: user.rolId,
      bloqueado: user.bloqueado,
      bloqueado_motivo: user.bloqueadoMotivo,
      intentos_fallidos: user.intentosFallidos,
      mfa_enabled: user.mfaEnabled,
      mfa_secret: user.mfaSecret,
      mfa_method: user.mfaMethod,
    };
    if (user.id) {
      await this.repo.update(user.id, ormData);
      const updated = await this.repo.findOne({
        where: { id: user.id },
        relations: ['rol'],
      });
      return this.toDomain(updated!);
    }
    const saved = await this.repo.save(ormData as Usuario);
    return this.toDomain(saved as any);
  }

  async update(id: number, data: Partial<UserDomain>): Promise<void> {
    const ormData: Partial<Usuario> = {};
    if (data.nombre !== undefined) ormData.nombre = data.nombre;
    if (data.apellido !== undefined) ormData.apellido = data.apellido;
    if (data.email !== undefined) ormData.email = data.email;
    if (data.bloqueado !== undefined) ormData.bloqueado = data.bloqueado;
    if (data.bloqueadoMotivo !== undefined)
      ormData.bloqueado_motivo = data.bloqueadoMotivo;
    if (data.intentosFallidos !== undefined)
      ormData.intentos_fallidos = data.intentosFallidos;
    if (data.mfaEnabled !== undefined) ormData.mfa_enabled = data.mfaEnabled;
    if (data.mfaSecret !== undefined) ormData.mfa_secret = data.mfaSecret;
    if (data.mfaMethod !== undefined) ormData.mfa_method = data.mfaMethod;
    if (data.password !== undefined) ormData.password = data.password;
    if (data.ultimoLogin !== undefined)
      ormData.ultimo_login = data.ultimoLogin as Date;
    await this.repo.update(id, ormData);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repo.count({ where: { email } });
    return count > 0;
  }

  async existsByCi(ci: string): Promise<boolean> {
    const count = await this.repo.count({ where: { ci } });
    return count > 0;
  }
}
