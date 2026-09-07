import { DiagnosticoDomain, Cie10Domain } from '../diagnostico.domain';

export abstract class DiagnosticoRepositoryPort {
  abstract findAll(): Promise<DiagnosticoDomain[]>;
  abstract findById(id: number): Promise<DiagnosticoDomain | null>;
  abstract findByConsulta(consultaId: number): Promise<DiagnosticoDomain[]>;
  abstract create(data: Partial<DiagnosticoDomain>): Promise<DiagnosticoDomain>;
  abstract update(
    id: number,
    data: Partial<DiagnosticoDomain>,
  ): Promise<DiagnosticoDomain>;
  abstract delete(id: number): Promise<void>;
  abstract findCie10(query?: string): Promise<Cie10Domain[]>;
}
