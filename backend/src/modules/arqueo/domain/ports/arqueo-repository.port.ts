import { ArqueoDomain } from '../arqueo.domain';

export abstract class ArqueoRepositoryPort {
  abstract findById(id: number): Promise<ArqueoDomain | null>;
  abstract findAll(order?: 'ASC' | 'DESC'): Promise<ArqueoDomain[]>;
  abstract create(data: Partial<ArqueoDomain>): Promise<ArqueoDomain>;
}
