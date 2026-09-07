import { ServicioDomain } from '../servicio.domain';

export interface ServicioQuery {
  especialidadId?: number;
  activo?: boolean;
  page?: number;
  limit?: number;
}

export abstract class ServicioRepositoryPort {
  abstract findAll(query: ServicioQuery): Promise<{
    data: ServicioDomain[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>;

  abstract findById(id: number): Promise<ServicioDomain | null>;

  abstract findByEspecialidad(especialidadId: number): Promise<ServicioDomain[]>;

  abstract findByMedico(medicoId: number): Promise<ServicioDomain[]>;

  abstract save(servicio: ServicioDomain): Promise<ServicioDomain>;

  abstract update(id: number, data: Partial<ServicioDomain>): Promise<ServicioDomain>;

  abstract remove(id: number): Promise<void>;
}