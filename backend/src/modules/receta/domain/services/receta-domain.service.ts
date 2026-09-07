import { Injectable, BadRequestException } from '@nestjs/common';
import { RecetaDomain, RecetaMedicamentoData } from '../receta.domain';

@Injectable()
export class RecetaDomainService {
  validarMedicamentoItem(item: RecetaMedicamentoData): void {
    if (!item.dosis || item.dosis.trim().length === 0) {
      throw new BadRequestException('La dosis del medicamento es requerida');
    }
    if (!item.frecuencia || item.frecuencia.trim().length === 0) {
      throw new BadRequestException(
        'La frecuencia del medicamento es requerida',
      );
    }
    if (item.cantidad != null && item.cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a cero');
    }
  }

  validarItemsUnicos(items: RecetaMedicamentoData[]): void {
    const seen = new Set<number>();
    for (const item of items) {
      if (seen.has(item.medicamentoId)) {
        throw new BadRequestException(
          `El medicamento ID ${item.medicamentoId} esta duplicado en la receta`,
        );
      }
      seen.add(item.medicamentoId);
    }
  }

  validarDispensacion(
    receta: RecetaDomain,
    dispensaciones: Array<{ recetaMedicamentoId: number; cantidad: number }>,
  ): void {
    if (receta.estado === 'dispensada_total') {
      throw new BadRequestException(
        'La receta ya fue completamente dispensada',
      );
    }
    if (receta.estado === 'cancelada') {
      throw new BadRequestException(
        'No se puede dispensar una receta cancelada',
      );
    }

    for (const d of dispensaciones) {
      if (d.cantidad <= 0) {
        throw new BadRequestException(
          'La cantidad a dispensar debe ser mayor a cero',
        );
      }
    }
  }
}
