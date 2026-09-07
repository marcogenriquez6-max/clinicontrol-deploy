import {
  IsString,
  IsInt,
  IsOptional,
  MinLength,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHistoricoTratamientoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  pacienteId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  medicamentoId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  consultaId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  recetaId?: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  fechaInicio: string;

  @ApiPropertyOptional({ example: '2024-03-15' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({ example: '1 tableta' })
  @IsString()
  @MinLength(1)
  dosis: string;

  @ApiProperty({ example: 'Cada 8 horas' })
  @IsString()
  @MinLength(1)
  frecuencia: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  viaAdministracionId?: number;

  @ApiPropertyOptional({ example: 'activo', default: 'activo' })
  @IsOptional()
  @IsString()
  @IsIn(['activo', 'suspendido', 'completado', 'cambiado', 'abandonado'])
  estado?: string;

  @ApiPropertyOptional({ example: 'Cambio por reacción adversa' })
  @IsOptional()
  @IsString()
  motivoCambio?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  medicoId?: number;

  @ApiPropertyOptional({ example: 'Paciente refiere mareos' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
