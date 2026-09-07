import { RolDomain } from '../rol.domain';

export abstract class RolRepositoryPort {
  abstract findAll(): Promise<RolDomain[]>;
  abstract findById(id: number): Promise<RolDomain | null>;
  abstract create(data: Partial<RolDomain>): Promise<RolDomain>;
  abstract update(id: number, data: Partial<RolDomain>): Promise<RolDomain>;
  abstract delete(id: number): Promise<void>;
}
