import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoAlergia } from '../../../../entities/tipo-alergia.entity';
import { TipoAlergiaRepositoryPort } from '../../domain/ports/tipo-alergia-repository.port';

@Injectable()
export class TipoAlergiaRepositoryAdapter implements TipoAlergiaRepositoryPort {
  constructor(
    @InjectRepository(TipoAlergia)
    private readonly repo: Repository<TipoAlergia>,
  ) {}

  findAll(): Promise<TipoAlergia[]> {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  findById(id: number): Promise<TipoAlergia | null> {
    return this.repo.findOne({ where: { id } });
  }
}
