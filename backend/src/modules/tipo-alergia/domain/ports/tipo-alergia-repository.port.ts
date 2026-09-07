import { TipoAlergia } from '../../../../entities/tipo-alergia.entity';

export abstract class TipoAlergiaRepositoryPort {
  abstract findAll(): Promise<TipoAlergia[]>;
  abstract findById(id: number): Promise<TipoAlergia | null>;
}
