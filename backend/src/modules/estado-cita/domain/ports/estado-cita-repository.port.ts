import { EstadoCitaDomain } from '../estado-cita.domain';

export abstract class EstadoCitaRepositoryPort {
  abstract findAll(): Promise<EstadoCitaDomain[]>;
  abstract findById(id: number): Promise<EstadoCitaDomain | null>;
  abstract create(data: Partial<EstadoCitaDomain>): Promise<EstadoCitaDomain>;
  abstract update(
    id: number,
    data: Partial<EstadoCitaDomain>,
  ): Promise<EstadoCitaDomain>;
  abstract delete(id: number): Promise<void>;
}
