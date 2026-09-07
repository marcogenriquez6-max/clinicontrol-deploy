import { AlergiaDomain } from '../alergia.domain';

export abstract class AlergiaRepositoryPort {
  abstract findAll(): Promise<AlergiaDomain[]>;
  abstract findById(id: number): Promise<AlergiaDomain | null>;
  abstract create(data: Partial<AlergiaDomain>): Promise<AlergiaDomain>;
  abstract update(
    id: number,
    data: Partial<AlergiaDomain>,
  ): Promise<AlergiaDomain>;
  abstract delete(id: number): Promise<void>;
  abstract search(query: string): Promise<AlergiaDomain[]>;
}
