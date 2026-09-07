import { RecetaDomain, RecetaMedicamentoDomain } from '../receta.domain';

export abstract class RecetaRepositoryPort {
  abstract findAll(estado?: string): Promise<RecetaDomain[]>;

  abstract findById(id: number): Promise<RecetaDomain | null>;

  abstract findByConsulta(consultaId: number): Promise<RecetaDomain[]>;

  abstract save(receta: RecetaDomain): Promise<RecetaDomain>;

  abstract update(
    id: number,
    data: Partial<RecetaDomain>,
  ): Promise<RecetaDomain>;

  abstract remove(id: number): Promise<void>;

  abstract addMedicamento(
    recetaId: number,
    item: RecetaMedicamentoDomain,
  ): Promise<RecetaMedicamentoDomain>;

  abstract removeMedicamento(itemId: number): Promise<void>;

  abstract findActiveByPaciente(pacienteId: number): Promise<RecetaDomain[]>;
}
