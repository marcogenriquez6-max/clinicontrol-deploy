import { BaseEntity } from '../../../common/domain/base.entity';

export type EstadoReceta =
  | 'activa'
  | 'dispensada_parcial'
  | 'dispensada_total'
  | 'cancelada';

export interface RecetaMedicamentoData {
  medicamentoId: number;
  dosis: string;
  frecuencia: string;
  duracion?: string;
  observaciones?: string;
  cantidad?: number;
}

export class RecetaMedicamentoDomain {
  id?: number;
  constructor(
    public readonly medicamentoId: number,
    public readonly dosis: string,
    public readonly frecuencia: string,
    public readonly duracion?: string,
    public readonly observaciones?: string,
    public cantidad?: number,
    public cantidadDispensada = 0,
    id?: number,
    public medicamentoNombre?: string,
  ) {}

  static create(data: RecetaMedicamentoData): RecetaMedicamentoDomain {
    return new RecetaMedicamentoDomain(
      data.medicamentoId,
      data.dosis,
      data.frecuencia,
      data.duracion,
      data.observaciones,
      data.cantidad,
    );
  }

  dispensar(cantidad: number): void {
    const nuevaDispensada = this.cantidadDispensada + cantidad;
    if (this.cantidad && nuevaDispensada > this.cantidad) {
      throw new Error(
        `La cantidad a dispensar (${nuevaDispensada}) excede la cantidad prescrita (${this.cantidad})`,
      );
    }
    this.cantidadDispensada = nuevaDispensada;
  }

  get estaTotalmenteDispensado(): boolean {
    if (this.cantidad == null) return false;
    return this.cantidadDispensada >= this.cantidad;
  }

  get pendienteDispensar(): number {
    if (this.cantidad == null) return 0;
    return this.cantidad - this.cantidadDispensada;
  }
}

export interface RecetaData {
  consultaId: number;
  instrucciones?: string;
  items?: RecetaMedicamentoData[];
}

export class RecetaDomain extends BaseEntity {
  public readonly items: RecetaMedicamentoDomain[] = [];
  public estado: EstadoReceta = 'activa';
  public instrucciones?: string;
  public readonly consultaId: number;

  constructor(data: RecetaData, id?: number) {
    super(id);
    this.consultaId = data.consultaId;
    this.instrucciones = data.instrucciones;
    if (data.items) {
      for (const item of data.items) {
        this.items.push(RecetaMedicamentoDomain.create(item));
      }
    }
  }

  agregarMedicamento(data: RecetaMedicamentoData): RecetaMedicamentoDomain {
    const item = RecetaMedicamentoDomain.create(data);
    this.items.push(item);
    return item;
  }

  eliminarMedicamento(itemId: number): void {
    const index = this.items.findIndex((i) => i.id === itemId);
    if (index === -1) throw new Error('Medicamento no encontrado en la receta');
    this.items.splice(index, 1);
  }

  dispensar(
    dispensaciones: Array<{ recetaMedicamentoId: number; cantidad: number }>,
  ): void {
    for (const d of dispensaciones) {
      const item = this.items.find((i) => i.id === d.recetaMedicamentoId);
      if (!item) {
        throw new Error(
          `Medicamento con ID ${d.recetaMedicamentoId} no encontrado en la receta`,
        );
      }
      item.dispensar(d.cantidad);
    }

    const todosCompletos = this.items.every((i) => i.estaTotalmenteDispensado);
    const algunoDispensado = this.items.some((i) => i.cantidadDispensada > 0);

    if (todosCompletos) {
      this.estado = 'dispensada_total';
    } else if (algunoDispensado) {
      this.estado = 'dispensada_parcial';
    }
  }

  cancelar(): void {
    this.estado = 'cancelada';
  }
}
