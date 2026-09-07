import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  VacunaRepositoryPort,
  PacienteVacunaRow,
} from '../../domain/ports/vacuna-repository.port';
import { VacunaDomain } from '../../domain/vacuna.domain';
import { Vacuna, PacienteVacuna } from '../../../../entities/vacuna.entity';

@Injectable()
export class VacunaRepositoryAdapter implements VacunaRepositoryPort {
  constructor(
    @InjectRepository(Vacuna)
    private readonly repo: Repository<Vacuna>,
    @InjectRepository(PacienteVacuna)
    private readonly pvRepo: Repository<PacienteVacuna>,
  ) {}

  private toDomain(orm: Vacuna): VacunaDomain {
    return new VacunaDomain(
      orm.id,
      orm.nombre,
      orm.descripcion,
      orm.dosisRecomendadas,
      orm.edadMinimaMeses,
      orm.edadMaximaMeses,
      orm.intervalodias,
      orm.esObligatoria,
      orm.activo,
    );
  }

  async findAll(): Promise<VacunaDomain[]> {
    const orms = await this.repo.find({ order: { nombre: 'ASC' } });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<VacunaDomain | null> {
    const orm = await this.repo.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async create(data: Partial<VacunaDomain>): Promise<VacunaDomain> {
    const orm = this.repo.create(data as any);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved as any);
  }

  async update(id: number, data: Partial<VacunaDomain>): Promise<VacunaDomain> {
    await this.repo.update(id, data as any);
    return this.findById(id) as Promise<VacunaDomain>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async search(query: string): Promise<VacunaDomain[]> {
    const orms = await this.repo
      .createQueryBuilder('vacuna')
      .where('LOWER(vacuna.nombre) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(vacuna.descripcion) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orderBy('vacuna.nombre', 'ASC')
      .limit(20)
      .getMany();
    return orms.map((o) => this.toDomain(o));
  }

  async findActivos(): Promise<VacunaDomain[]> {
    const orms = await this.repo.find({
      where: { activo: true } as any,
      order: { nombre: 'ASC' },
    });
    return orms.map((o) => this.toDomain(o));
  }

  private toPacienteVacunaRow(orm: PacienteVacuna): PacienteVacunaRow {
    return {
      id: orm.id,
      pacienteId: orm.pacienteId,
      vacunaId: orm.vacunaId,
      dosisNumero: orm.dosisNumero,
      fechaAplicacion: orm.fechaAplicacion,
      lote: orm.lote,
      laboratorio: orm.laboratorio,
      lugarAplicacion: orm.lugarAplicacion,
      aplicadoPorId: orm.aplicadoPorId,
      proximaDosis: orm.proximaDosis,
      observaciones: orm.observaciones,
      createdAt: orm.createdAt,
      vacuna: orm.vacuna ? this.toDomain(orm.vacuna) : undefined,
    };
  }

  async findAplicacionesByPacienteId(
    pacienteId: number,
  ): Promise<PacienteVacunaRow[]> {
    const orms = await this.pvRepo.find({
      where: { pacienteId },
      relations: ['vacuna'],
      order: { fechaAplicacion: 'DESC' },
    });
    return orms.map((o) => this.toPacienteVacunaRow(o));
  }

  async createAplicacion(data: {
    pacienteId: number;
    vacunaId: number;
    dosisNumero?: number;
    fechaAplicacion: string;
    lote?: string;
    laboratorio?: string;
    lugarAplicacion?: string;
    aplicadoPorId?: number;
    proximaDosis?: string;
    observaciones?: string;
  }): Promise<PacienteVacunaRow> {
    const orm = this.pvRepo.create({
      pacienteId: data.pacienteId,
      vacunaId: data.vacunaId,
      dosisNumero: data.dosisNumero ?? 1,
      fechaAplicacion: data.fechaAplicacion,
      lote: data.lote ?? null,
      laboratorio: data.laboratorio ?? null,
      lugarAplicacion: data.lugarAplicacion ?? null,
      aplicadoPorId: data.aplicadoPorId ?? null,
      proximaDosis: data.proximaDosis ?? null,
      observaciones: data.observaciones ?? null,
    } as any);
    const saved = (await this.pvRepo.save(orm)) as unknown as PacienteVacuna;
    const full = await this.pvRepo.findOne({
      where: { id: saved.id },
      relations: ['vacuna'],
    });
    return this.toPacienteVacunaRow(full!);
  }

  async deleteAplicacion(id: number): Promise<void> {
    await this.pvRepo.delete(id);
  }
}
