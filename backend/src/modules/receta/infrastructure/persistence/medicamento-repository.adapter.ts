import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import {
  MedicamentoRepositoryPort,
  MedicamentoReadModel,
} from '../../domain/ports/medicamento-repository.port';
import { Medicamento } from '../../../../entities/receta-medicamento.entity';

@Injectable()
export class MedicamentoRepositoryAdapter implements MedicamentoRepositoryPort {
  constructor(
    @InjectRepository(Medicamento)
    private readonly repo: Repository<Medicamento>,
  ) {}

  async search(query?: string): Promise<MedicamentoReadModel[]> {
    if (query) {
      return this.repo.find({
        where: { nombre: ILike(`%${query}%`) },
        take: 20,
      });
    }
    return this.repo.find({ take: 20 });
  }

  async findById(id: number): Promise<MedicamentoReadModel | null> {
    return this.repo.findOne({ where: { id } });
  }
}
