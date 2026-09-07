import { PacienteDomain } from '../paciente.domain';

export class PacienteQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export abstract class PacienteRepositoryPort {
  abstract findById(id: number): Promise<PacienteDomain | null>;
  abstract findByCi(ci: string): Promise<PacienteDomain | null>;
  abstract findAll(query: PacienteQuery): Promise<{
    data: PacienteDomain[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>;
  abstract buscarPorTexto(texto: string): Promise<PacienteDomain[]>;
  abstract save(paciente: PacienteDomain): Promise<PacienteDomain>;
  abstract update(
    id: number,
    data: Partial<PacienteDomain>,
  ): Promise<PacienteDomain>;
  abstract softDelete(id: number): Promise<void>;
  abstract existsByCi(ci: string, excludeId?: number): Promise<boolean>;
  abstract findHistoriaClinica(id: number): Promise<PacienteDomain | null>;
  abstract findPerfilCompleto(id: number): Promise<PacienteDomain | null>;
  abstract addAlergia(
    pacienteId: number,
    alergiaId: number,
    severidad?: string,
  ): Promise<void>;
}
