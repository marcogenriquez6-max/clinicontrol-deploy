import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PacienteRepositoryPort,
  PacienteQuery,
} from '../../domain/ports/paciente-repository.port';
import { PacienteDomain, AlergiaInfo } from '../../domain/paciente.domain';
import { Paciente } from '../../../../entities/paciente.entity';
import { Alergia } from '../../../../entities/alergia.entity';
import { Diagnostico } from '../../../../entities/diagnostico.entity';

@Injectable()
export class PacienteRepositoryAdapter implements PacienteRepositoryPort {
  constructor(
    @InjectRepository(Paciente)
    private readonly repo: Repository<Paciente>,
    @InjectRepository(Alergia)
    private readonly alergiaRepo: Repository<Alergia>,
    @InjectRepository(Diagnostico)
    private readonly diagnosticoRepo: Repository<Diagnostico>,
  ) {}

  private toDomain(orm: Paciente): PacienteDomain {
    const domain = new PacienteDomain({
      id: orm.id,
      nombre: orm.nombre,
      apellido: orm.apellido,
      ci: orm.ci,
      fechaNacimiento: orm.fechaNacimiento,
      generoId: orm.generoId,
      telefono: orm.telefono,
      direccion: orm.direccion,
      email: orm.email,
      grupoSanguineoId: orm.grupoSanguineoId,
      usuarioRegistroId: orm.usuarioRegistroId,
      sucursalId: orm.sucursalId,
      contactoEmergenciaNombre: orm.contactoEmergenciaNombre,
      contactoEmergenciaTelefono: orm.contactoEmergenciaTelefono,
    });
    domain.activo = orm.activo;
    domain.estado = orm.activo ? 'activo' : 'inactivo';
    domain.especialidad = orm.especialidad;
    domain.createdAt = orm.createdAt;
    domain.updatedAt = orm.updatedAt;
    domain.alergias = orm.alergias
      ? orm.alergias.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          severidad: a.severidad,
        }))
      : [];
    domain.cirugiasPrevias = orm.cirugiasPrevias
      ? orm.cirugiasPrevias.map((c) => ({
          id: c.id,
          descripcion: c.nombreProcedimiento,
          fecha: new Date(c.fechaCirugia),
        }))
      : [];
    if (orm.vacunas) {
      domain.vacunas = orm.vacunas.map((v) => ({
        id: v.id,
        nombre: v.vacuna?.nombre || '',
        fechaAplicacion: new Date(v.fechaAplicacion),
      }));
    }
    return domain;
  }

  private toOrm(domain: PacienteDomain): Partial<Paciente> {
    return {
      id: domain.id,
      nombre: domain.nombre,
      apellido: domain.apellido,
      ci: domain.ci,
      fechaNacimiento: domain.fechaNacimiento,
      generoId: domain.generoId,
      telefono: domain.telefono,
      direccion: domain.direccion,
      email: domain.email,
      grupoSanguineoId: domain.grupoSanguineoId,
      usuarioRegistroId: domain.usuarioRegistroId,
      sucursalId: domain.sucursalId,
      activo: domain.activo,
      especialidad: domain.especialidad,
      contactoEmergenciaNombre: domain.contactoEmergenciaNombre,
      contactoEmergenciaTelefono: domain.contactoEmergenciaTelefono,
    };
  }

  async findById(id: number): Promise<PacienteDomain | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: ['genero', 'grupoSanguineo'],
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findByCi(ci: string): Promise<PacienteDomain | null> {
    const orm = await this.repo.findOne({
      where: { ci },
      relations: ['genero', 'grupoSanguineo'],
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findAll(query: PacienteQuery): Promise<{
    data: PacienteDomain[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const searchFields = [
      'nombre',
      'apellido',
      'ci',
      'email',
      'telefono',
      'especialidad',
    ];

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.genero', 'genero')
      .leftJoinAndSelect('p.grupoSanguineo', 'grupoSanguineo')
      .where('p.activo = :activo', { activo: true })
      .skip(skip)
      .take(limit)
      .orderBy('p.apellido', 'ASC')
      .addOrderBy('p.nombre', 'ASC');

    if (search) {
      const conditions = searchFields.map(
        (field) => `p.${field} ILike :search`,
      );
      qb.andWhere(`(${conditions.join(' OR ')})`, { search: `%${search}%` });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((o) => this.toDomain(o)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async buscarPorTexto(texto: string): Promise<PacienteDomain[]> {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.genero', 'genero')
      .leftJoinAndSelect('p.grupoSanguineo', 'grupoSanguineo')
      .where(
        `(p.nombre ILike :query OR p.apellido ILike :query OR p.ci ILike :query OR p.telefono ILike :query OR p.email ILike :query OR p.especialidad ILike :query)`,
        { query: `%${texto}%` },
      )
      .orderBy('p.apellido', 'ASC')
      .addOrderBy('p.nombre', 'ASC')
      .take(20);

    const data = await qb.getMany();
    return data.map((o) => this.toDomain(o));
  }

  async save(paciente: PacienteDomain): Promise<PacienteDomain> {
    const ormData = this.toOrm(paciente);
    if (paciente.id) {
      await this.repo.update(paciente.id, ormData);
      const updated = await this.repo.findOne({
        where: { id: paciente.id },
        relations: ['genero', 'grupoSanguineo'],
      });
      return this.toDomain(updated!);
    }
    const saved = await this.repo.save(ormData as Paciente);
    return this.toDomain(saved as any);
  }

  async update(
    id: number,
    data: Partial<PacienteDomain>,
  ): Promise<PacienteDomain> {
    await this.repo.update(id, this.toOrm(data as PacienteDomain));
    const updated = await this.repo.findOne({
      where: { id },
      relations: ['genero', 'grupoSanguineo'],
    });
    return this.toDomain(updated!);
  }

  async softDelete(id: number): Promise<void> {
    await this.repo.update(id, { activo: false });
  }

  async existsByCi(ci: string, excludeId?: number): Promise<boolean> {
    const qb = this.repo.createQueryBuilder('p').where('p.ci = :ci', { ci });
    if (excludeId) qb.andWhere('p.id != :excludeId', { excludeId });
    const count = await qb.getCount();
    return count > 0;
  }

  async findHistoriaClinica(id: number): Promise<PacienteDomain | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: [
        'genero',
        'grupoSanguineo',
        'alergias',
        'cirugiasPrevias',
        'vacunas',
        'citas',
        'citas.medico',
        'citas.estado',
        'citas.sucursal',
        'consultas',
        'consultas.medico',
        'consultas.medico.especialidad',
        'consultas.medico.sucursal',
        'consultas.diagnosticos',
        'consultas.diagnosticos.cie10',
        'consultas.recetas',
        'consultas.recetas.items',
        'consultas.recetas.items.medicamento',
        'consultas.notasEvolucion',
        'consultas.notasEvolucion.creadoPor',
      ],
      order: { consultas: { fecha: 'DESC' }, citas: { fecha: 'DESC' } } as any,
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findPerfilCompleto(id: number): Promise<PacienteDomain | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: [
        'genero',
        'grupoSanguineo',
        'usuarioRegistro',
        'sucursal',
        'alergias',
        'cirugiasPrevias',
        'vacunas',
        'citas',
        'citas.medico',
        'citas.estado',
        'citas.sucursal',
        'consultas',
        'consultas.medico',
        'consultas.medico.especialidad',
        'consultas.sucursal',
        'consultas.diagnosticos',
        'consultas.diagnosticos.cie10',
        'consultas.recetas',
        'consultas.recetas.items',
        'consultas.recetas.items.medicamento',
      ],
      order: { consultas: { fecha: 'DESC' }, citas: { fecha: 'DESC' } } as any,
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async addAlergia(
    pacienteId: number,
    alergiaId: number,
    severidad?: string,
  ): Promise<void> {
    const paciente = await this.repo.findOne({
      where: { id: pacienteId },
      relations: ['alergias'],
    });
    if (!paciente)
      throw new NotFoundException(
        `Paciente con ID ${pacienteId} no encontrado`,
      );

    const alergia = await this.alergiaRepo.findOne({
      where: { id: alergiaId },
    });
    if (!alergia)
      throw new NotFoundException(`Alergia con ID ${alergiaId} no encontrada`);

    paciente.alergias.push(alergia);
    await this.repo.save(paciente);
  }
}
