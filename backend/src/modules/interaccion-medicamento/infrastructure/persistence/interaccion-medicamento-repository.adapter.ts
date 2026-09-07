import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InteraccionMedicamentoRepositoryPort } from '../../domain/ports/interaccion-medicamento-repository.port';
import {
  MedicamentoInteraccionDomain,
  InteraccionSeveridadDomain,
} from '../../domain/interaccion-medicamento.domain';
import { MedicamentoInteraccion } from '../../../../entities/medicamento-interaccion.entity';
import { Medicamento } from '../../../../entities/receta-medicamento.entity';

@Injectable()
export class InteraccionMedicamentoRepositoryAdapter extends InteraccionMedicamentoRepositoryPort {
  constructor(
    @InjectRepository(MedicamentoInteraccion)
    private readonly repo: Repository<MedicamentoInteraccion>,
    @InjectRepository(Medicamento)
    private readonly medicamentoRepo: Repository<Medicamento>,
  ) {
    super();
  }

  private toDomain(e: MedicamentoInteraccion): MedicamentoInteraccionDomain {
    return new MedicamentoInteraccionDomain(
      e.id,
      e.medicamentoId1,
      e.medicamentoId2,
      e.severidad as InteraccionSeveridadDomain,
      e.descripcion,
      e.recomendacion,
      e.createdAt,
    );
  }

  async findAll(): Promise<MedicamentoInteraccionDomain[]> {
    const entities = await this.repo.find({
      relations: ['medicamento1', 'medicamento2'],
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: number): Promise<MedicamentoInteraccionDomain | null> {
    const e = await this.repo.findOne({
      where: { id },
      relations: ['medicamento1', 'medicamento2'],
    });
    return e ? this.toDomain(e) : null;
  }

  async create(
    data: Partial<MedicamentoInteraccionDomain>,
  ): Promise<MedicamentoInteraccionDomain> {
    const entity = this.repo.create(data as any);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved as any);
  }

  async update(
    id: number,
    data: Partial<MedicamentoInteraccionDomain>,
  ): Promise<MedicamentoInteraccionDomain> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Interacción con ID ${id} no encontrada`);
    Object.assign(entity, data);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved as any);
  }

  async delete(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Interacción con ID ${id} no encontrada`);
  }

  async verificarInteracciones(medicamentoIds: number[]): Promise<any[]> {
    if (!medicamentoIds || medicamentoIds.length < 2) return [];
    const interacciones = await this.repo.find({
      where: [
        {
          medicamentoId1: In(medicamentoIds),
          medicamentoId2: In(medicamentoIds),
        },
      ],
      relations: ['medicamento1', 'medicamento2'],
    });
    return interacciones.map((i) => ({
      medicamentoId1: i.medicamentoId1,
      medicamento1: i.medicamento1?.nombre,
      medicamentoId2: i.medicamentoId2,
      medicamento2: i.medicamento2?.nombre,
      severidad: i.severidad,
      descripcion: i.descripcion,
      recomendacion: i.recomendacion,
    }));
  }

  async ensureMedicamentoExists(id: number): Promise<void> {
    const medicamento = await this.medicamentoRepo.findOne({ where: { id } });
    if (!medicamento)
      throw new NotFoundException(`Medicamento con ID ${id} no encontrado`);
  }
}
