import { MedicamentoInteraccionDomain } from '../interaccion-medicamento.domain';

export abstract class InteraccionMedicamentoRepositoryPort {
  abstract findAll(): Promise<MedicamentoInteraccionDomain[]>;
  abstract findById(id: number): Promise<MedicamentoInteraccionDomain | null>;
  abstract create(
    data: Partial<MedicamentoInteraccionDomain>,
  ): Promise<MedicamentoInteraccionDomain>;
  abstract update(
    id: number,
    data: Partial<MedicamentoInteraccionDomain>,
  ): Promise<MedicamentoInteraccionDomain>;
  abstract delete(id: number): Promise<void>;
  abstract verificarInteracciones(medicamentoIds: number[]): Promise<any[]>;
  abstract ensureMedicamentoExists(id: number): Promise<void>;
}
