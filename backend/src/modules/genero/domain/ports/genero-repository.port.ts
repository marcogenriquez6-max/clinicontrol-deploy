import { GeneroDomain } from '../genero.domain';

export abstract class GeneroRepositoryPort {
  abstract findAll(): Promise<GeneroDomain[]>;
  abstract findById(id: number): Promise<GeneroDomain | null>;
  abstract create(data: Partial<GeneroDomain>): Promise<GeneroDomain>;
  abstract update(
    id: number,
    data: Partial<GeneroDomain>,
  ): Promise<GeneroDomain>;
  abstract delete(id: number): Promise<void>;
}
