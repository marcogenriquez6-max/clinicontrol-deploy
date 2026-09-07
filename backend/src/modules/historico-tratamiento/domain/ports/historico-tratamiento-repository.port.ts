import { HistoricoTratamientoDomain } from '../historico-tratamiento.domain';

export abstract class HistoricoTratamientoRepositoryPort {
  abstract findAll(): Promise<HistoricoTratamientoDomain[]>;
  abstract findById(id: number): Promise<HistoricoTratamientoDomain | null>;
  abstract create(
    data: Partial<HistoricoTratamientoDomain>,
  ): Promise<HistoricoTratamientoDomain>;
  abstract update(
    id: number,
    data: Partial<HistoricoTratamientoDomain>,
  ): Promise<HistoricoTratamientoDomain>;
  abstract delete(id: number): Promise<void>;
  abstract findByPaciente(
    pacienteId: number,
  ): Promise<HistoricoTratamientoDomain[]>;
  abstract findActivos(
    pacienteId: number,
  ): Promise<HistoricoTratamientoDomain[]>;
}
