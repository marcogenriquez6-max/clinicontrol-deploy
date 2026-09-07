import { CajaSessionDomain } from '../caja.domain';

export abstract class CajaRepositoryPort {
  abstract findById(id: number): Promise<CajaSessionDomain | null>;
  abstract findSesionAbierta(): Promise<CajaSessionDomain | null>;
  abstract findAll(order?: 'ASC' | 'DESC'): Promise<CajaSessionDomain[]>;
  abstract create(data: Partial<CajaSessionDomain>): Promise<CajaSessionDomain>;
  abstract update(id: number, data: Partial<CajaSessionDomain>): Promise<void>;
}
