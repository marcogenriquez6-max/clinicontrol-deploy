export interface MedicamentoReadModel {
  id: number;
  nombre: string;
  presentacion?: string;
  concentracion?: string;
}

export abstract class MedicamentoRepositoryPort {
  abstract search(query?: string): Promise<MedicamentoReadModel[]>;

  abstract findById(id: number): Promise<MedicamentoReadModel | null>;
}
