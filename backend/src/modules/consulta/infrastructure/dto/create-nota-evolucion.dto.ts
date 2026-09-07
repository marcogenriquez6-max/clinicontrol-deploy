import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoNotaEvolucion } from '../../../../entities/nota-evolucion.entity';

export class CreateNotaEvolucionDto {
  @ApiProperty({ example: 'Se corrige el plan de tratamiento...' })
  @IsString()
  @IsNotEmpty({ message: 'El contenido de la nota no puede estar vacío' })
  @MinLength(3, {
    message: 'El contenido de la nota debe tener al menos 3 caracteres',
  })
  @MaxLength(5000, {
    message: 'El contenido de la nota no puede exceder 5000 caracteres',
  })
  contenido: string;

  @ApiProperty({
    enum: Object.values(TipoNotaEvolucion),
    default: TipoNotaEvolucion.NOTA_MEDICA,
    example: TipoNotaEvolucion.NOTA_MEDICA,
  })
  @IsOptional()
  @IsEnum(TipoNotaEvolucion, {
    message:
      'Tipo de nota inválido. Use: evolucion, nota_medica, reporte, indicacion o hoja_enfermeria',
  })
  tipo?: string;
}
