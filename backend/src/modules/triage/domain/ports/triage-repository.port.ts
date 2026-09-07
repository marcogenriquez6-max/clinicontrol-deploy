import { TriageDomain } from '../triage.domain';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TriageQuery {
  estado?: string;
  pacienteId?: number;
  page?: number;
  limit?: number;
}

export abstract class TriageRepositoryPort {
  abstract create(
    data: Partial<TriageDomain>,
    usuarioId: number,
  ): Promise<TriageDomain>;
  abstract findAll(
    query: TriageQuery,
  ): Promise<{ data: TriageDomain[]; meta: PaginationMeta }>;
  abstract findById(id: number): Promise<TriageDomain | null>;
  abstract findByPaciente(pacienteId: number): Promise<TriageDomain[]>;
  abstract findActivos(): Promise<TriageDomain[]>;
  abstract update(
    id: number,
    data: Partial<TriageDomain>,
  ): Promise<TriageDomain>;
  abstract softDelete(id: number): Promise<void>;
}
