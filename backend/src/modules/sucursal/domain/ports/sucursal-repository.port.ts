import { SucursalDomain } from '../sucursal.domain';

export abstract class SucursalRepositoryPort {
  abstract findAll(): Promise<SucursalDomain[]>;
  abstract findById(id: number): Promise<SucursalDomain | null>;
  abstract create(data: Partial<SucursalDomain>): Promise<SucursalDomain>;
  abstract update(
    id: number,
    data: Partial<SucursalDomain>,
  ): Promise<SucursalDomain>;
  abstract delete(id: number): Promise<void>;
}
