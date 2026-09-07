import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InteraccionSeveridad } from '../../../../entities/medicamento-interaccion.entity';

export class CreateInteraccionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  medicamentoId1: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  medicamentoId2: number;

  @ApiPropertyOptional({
    enum: InteraccionSeveridad,
    example: InteraccionSeveridad.MODERADA,
  })
  @IsOptional()
  @IsEnum(InteraccionSeveridad)
  severidad?: InteraccionSeveridad;

  @ApiProperty({ example: 'Aumenta el riesgo de sangrado cuando se combinan' })
  @IsString()
  @MinLength(5)
  descripcion: string;

  @ApiPropertyOptional({
    example: 'Evitar uso concomitante. Monitorear INR frecuentemente.',
  })
  @IsOptional()
  @IsString()
  recomendacion?: string;
}

export class UpdateInteraccionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  medicamentoId1?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  medicamentoId2?: number;

  @ApiPropertyOptional({
    enum: InteraccionSeveridad,
    example: InteraccionSeveridad.MODERADA,
  })
  @IsOptional()
  @IsEnum(InteraccionSeveridad)
  severidad?: InteraccionSeveridad;

  @ApiPropertyOptional({
    example: 'Aumenta el riesgo de sangrado cuando se combinan',
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  descripcion?: string;

  @ApiPropertyOptional({
    example: 'Evitar uso concomitante. Monitorear INR frecuentemente.',
  })
  @IsOptional()
  @IsString()
  recomendacion?: string;
}

export class VerificarInteraccionesDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Lista de IDs de medicamentos a verificar',
  })
  @IsInt({ each: true })
  medicamentoIds: number[];
}

export class VerificarInteraccionesPacienteDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  pacienteId: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'Lista de IDs de medicamentos a verificar',
  })
  @IsInt({ each: true })
  medicamentoIds: number[];
}
