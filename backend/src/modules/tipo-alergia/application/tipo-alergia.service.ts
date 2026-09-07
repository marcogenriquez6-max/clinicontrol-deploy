import { Injectable, NotFoundException } from '@nestjs/common';
import { TipoAlergiaRepositoryPort } from '../domain/ports/tipo-alergia-repository.port';
import { TipoAlergia } from '../../../entities/tipo-alergia.entity';

@Injectable()
export class TipoAlergiaService {
  constructor(private readonly repo: TipoAlergiaRepositoryPort) {}

  findAll(): Promise<TipoAlergia[]> {
    return this.repo.findAll();
  }

  async findOne(id: number): Promise<TipoAlergia> {
    const tipo = await this.repo.findById(id);
    if (!tipo) {
      throw new NotFoundException(`Tipo de alergia con ID ${id} no encontrado`);
    }
    return tipo;
  }
}
