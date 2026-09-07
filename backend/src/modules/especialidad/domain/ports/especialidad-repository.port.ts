import { EspecialidadDomain } from '../especialidad.domain';

export abstract class EspecialidadRepositoryPort {
  abstract findAll(): Promise<EspecialidadDomain[]>;
  abstract findById(id: number): Promise<EspecialidadDomain | null>;
  abstract create(
    data: Partial<EspecialidadDomain>,
  ): Promise<EspecialidadDomain>;
  abstract update(
    id: number,
    data: Partial<EspecialidadDomain>,
  ): Promise<EspecialidadDomain>;
  abstract delete(id: number): Promise<void>;
}
