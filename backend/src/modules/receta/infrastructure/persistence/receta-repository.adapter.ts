import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { RecetaRepositoryPort } from '../../domain/ports/receta-repository.port';
import {
  RecetaDomain,
  RecetaMedicamentoDomain,
} from '../../domain/receta.domain';
import {
  Receta as RecetaOrm,
  RecetaMedicamento as RecetaMedicamentoOrm,
} from '../../../../entities/receta-medicamento.entity';

@Injectable()
export class RecetaRepositoryAdapter implements RecetaRepositoryPort {
  constructor(
    @InjectRepository(RecetaOrm)
    private readonly repo: Repository<RecetaOrm>,
    @InjectRepository(RecetaMedicamentoOrm)
    private readonly itemRepo: Repository<RecetaMedicamentoOrm>,
  ) {}

  private toDomain(orm: RecetaOrm): RecetaDomain {
    const domain = new RecetaDomain(
      {
        consultaId: orm.consultaId,
        instrucciones: orm.instrucciones,
      },
      orm.id,
    );
    domain.estado = orm.estado as RecetaDomain['estado'];
    domain.createdAt = orm.createdAt;
    // Nombres denormalizados (paciente/médico) para la lista, tomados de la consulta.
    const cp = (orm as any).consulta?.paciente;
    const cm = (orm as any).consulta?.medico;
    (domain as any).pacienteNombre = cp
      ? `${cp.nombre} ${cp.apellido}`
      : undefined;
    (domain as any).medicoNombre = cm
      ? `${cm.nombre} ${cm.apellido}`
      : undefined;

    if (orm.items) {
      for (const item of orm.items) {
        domain.items.push(
          new RecetaMedicamentoDomain(
            item.medicamentoId,
            item.dosis,
            item.frecuencia,
            item.duracion,
            item.observaciones,
            item.cantidad,
            item.cantidadDispensada,
            item.id,
            item.medicamento?.nombre,
          ),
        );
      }
    }

    return domain;
  }

  async findAll(estado?: string): Promise<RecetaDomain[]> {
    const where: Record<string, unknown> = {};
    if (estado) where.estado = estado;

    const data = await this.repo.find({
      where,
      relations: [
        'items',
        'items.medicamento',
        'consulta',
        'consulta.paciente',
        'consulta.medico',
      ],
      order: { createdAt: 'DESC' },
    });
    return data.map((o) => this.toDomain(o));
  }

  async findById(id: number): Promise<RecetaDomain | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: ['items', 'items.medicamento'],
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findByConsulta(consultaId: number): Promise<RecetaDomain[]> {
    const data = await this.repo.find({
      where: { consultaId },
      relations: ['items', 'items.medicamento'],
    });
    return data.map((o) => this.toDomain(o));
  }

  async save(receta: RecetaDomain): Promise<RecetaDomain> {
    if (receta.id) {
      await this.repo.update(receta.id, {
        estado: receta.estado,
        instrucciones: receta.instrucciones,
      } as any);

      for (const item of receta.items) {
        if (item.id) {
          await this.itemRepo.update(item.id, {
            cantidadDispensada: item.cantidadDispensada,
          } as any);
        }
      }

      return this.findById(receta.id) as Promise<RecetaDomain>;
    }

    const orm = this.repo.create({
      consultaId: receta.consultaId,
      instrucciones: receta.instrucciones,
      estado: receta.estado,
    });
    const saved = await this.repo.save(orm);

    for (const item of receta.items) {
      const ormItem = this.itemRepo.create({
        recetaId: saved.id,
        medicamentoId: item.medicamentoId,
        dosis: item.dosis,
        frecuencia: item.frecuencia,
        duracion: item.duracion,
        observaciones: item.observaciones,
        cantidad: item.cantidad,
        cantidadDispensada: item.cantidadDispensada,
      });
      await this.itemRepo.save(ormItem);
    }

    return this.findById(saved.id) as Promise<RecetaDomain>;
  }

  async update(id: number, data: Partial<RecetaDomain>): Promise<RecetaDomain> {
    const ormData: Partial<RecetaOrm> = {};
    if (data.instrucciones !== undefined)
      ormData.instrucciones = data.instrucciones;
    await this.repo.update(id, ormData as any);
    return this.findById(id) as Promise<RecetaDomain>;
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }
  }

  async addMedicamento(
    recetaId: number,
    item: RecetaMedicamentoDomain,
  ): Promise<RecetaMedicamentoDomain> {
    const orm = this.itemRepo.create({
      recetaId,
      medicamentoId: item.medicamentoId,
      dosis: item.dosis,
      frecuencia: item.frecuencia,
      duracion: item.duracion,
      observaciones: item.observaciones,
      cantidad: item.cantidad,
    });
    const saved = await this.itemRepo.save(orm);
    return new RecetaMedicamentoDomain(
      saved.medicamentoId,
      saved.dosis,
      saved.frecuencia,
      saved.duracion ?? undefined,
      saved.observaciones ?? undefined,
      saved.cantidad ?? undefined,
      saved.cantidadDispensada,
      saved.id,
    );
  }

  async removeMedicamento(itemId: number): Promise<void> {
    const result = await this.itemRepo.delete(itemId);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Medicamento de receta con ID ${itemId} no encontrado`,
      );
    }
  }

  async findActiveByPaciente(pacienteId: number): Promise<RecetaDomain[]> {
    const data = await this.repo
      .createQueryBuilder('receta')
      .leftJoinAndSelect('receta.items', 'items')
      .leftJoinAndSelect('items.medicamento', 'medicamento')
      .where('receta.estado = :estado', { estado: 'activa' })
      .andWhere(
        'receta.consultaId IN (SELECT c.id FROM consulta c WHERE c.paciente_id = :pacienteId)',
        { pacienteId },
      )
      .getMany();
    return data.map((o) => this.toDomain(o));
  }
}
