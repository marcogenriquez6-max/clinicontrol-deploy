import { CitaDomain } from '../cita.domain';
import { CitaQuery } from '../../infrastructure/dto/create-cita.dto';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class CitaRepositoryPort {
  abstract findAll(query: CitaQuery): Promise<{
    data: CitaDomain[];
    meta: PaginationMeta;
  }>;

  abstract findById(id: number): Promise<CitaDomain | null>;

  abstract findConflicts(
    medicoId: number,
    fecha: Date,
    horaInicio: string,
    horaFin: string,
    excludeId?: number,
  ): Promise<{
    hasConflict: boolean;
    conflictingCita?: CitaDomain;
    medicoNombre?: string;
  }>;

  abstract findDisponibilidad(
    medicoId: number,
    fecha: Date,
  ): Promise<Array<{ horaInicio: string; horaFin: string; estado: string }>>;

  abstract save(cita: CitaDomain): Promise<CitaDomain>;

  abstract update(id: number, data: Partial<CitaDomain>): Promise<CitaDomain>;

  abstract remove(id: number): Promise<void>;

  abstract findEstadoCanceladaId(): Promise<number>;
}
