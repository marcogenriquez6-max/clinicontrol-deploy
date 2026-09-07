import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CirugiaPreviaRepositoryPort } from '../../domain/ports/cirugia-previa-repository.port';
import { CirugiaPreviaDomain } from '../../domain/cirugia-previa.domain';
import { CirugiaPrevia } from '../../../../entities/cirugia-previa.entity';

@Injectable()
export class CirugiaPreviaRepositoryAdapter implements CirugiaPreviaRepositoryPort {
  constructor(
    @InjectRepository(CirugiaPrevia)
    private readonly repo: Repository<CirugiaPrevia>,
  ) {}

  private toDomain(orm: CirugiaPrevia): CirugiaPreviaDomain {
    return new CirugiaPreviaDomain(
      orm.id,
      orm.pacienteId,
      orm.nombreProcedimiento,
      orm.fechaCirugia,
      orm.hospital,
      orm.medicoCirujano,
      orm.tipoAnestesia,
      orm.complicaciones,
      orm.observaciones,
    );
  }

  async findAll(): Promise<CirugiaPreviaDomain[]> {
    const orms = await this.repo.find();
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<CirugiaPreviaDomain | null> {
    const orm = await this.repo.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async create(
    data: Partial<CirugiaPreviaDomain>,
  ): Promise<CirugiaPreviaDomain> {
    const orm = this.repo.create(data as any);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved as any);
  }

  async update(
    id: number,
    data: Partial<CirugiaPreviaDomain>,
  ): Promise<CirugiaPreviaDomain> {
    await this.repo.update(id, data as any);
    return this.findById(id) as Promise<CirugiaPreviaDomain>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async findByPaciente(pacienteId: number): Promise<CirugiaPreviaDomain[]> {
    const orms = await this.repo.find({
      where: { pacienteId } as any,
      order: { fechaCirugia: 'DESC' },
    });
    return orms.map((o) => this.toDomain(o));
  }
}
