import { TipoAtencionDomain } from '../tipo-atencion.domain';

export abstract class TipoAtencionRepositoryPort {
  abstract findAll(): Promise<TipoAtencionDomain[]>;
  abstract findById(id: number): Promise<TipoAtencionDomain | null>;
  abstract create(
    data: Partial<TipoAtencionDomain>,
  ): Promise<TipoAtencionDomain>;
  abstract update(
    id: number,
    data: Partial<TipoAtencionDomain>,
  ): Promise<TipoAtencionDomain>;
  abstract delete(id: number): Promise<void>;
}
