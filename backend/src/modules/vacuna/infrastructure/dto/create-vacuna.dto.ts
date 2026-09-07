import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVacunaDto {
  @ApiProperty({ example: 'BCG' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nombre: string;

  @ApiPropertyOptional({ example: 'Vacuna contra la tuberculosis' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  dosisRecomendadas?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  edadMinimaMeses?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  edadMaximaMeses?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  intervalodias?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  esObligatoria?: boolean;
}

export class UpdateVacunaDto {
  @ApiPropertyOptional({ example: 'BCG' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Vacuna contra la tuberculosis' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  dosisRecomendadas?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  edadMinimaMeses?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  edadMaximaMeses?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  intervalodias?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  esObligatoria?: boolean;
}

export class AplicarVacunaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  pacienteId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  vacunaId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  dosisNumero?: number;

  @ApiProperty({ example: '2024-03-15' })
  @IsDateString()
  fechaAplicacion: string;

  @ApiPropertyOptional({ example: 'LOTE-12345' })
  @IsOptional()
  @IsString()
  lote?: string;

  @ApiPropertyOptional({ example: 'Pfizer' })
  @IsOptional()
  @IsString()
  laboratorio?: string;

  @ApiPropertyOptional({ example: 'Deltoides izquierda' })
  @IsOptional()
  @IsString()
  lugarAplicacion?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  aplicadoPorId?: number;

  @ApiPropertyOptional({ example: '2024-06-15' })
  @IsOptional()
  @IsDateString()
  proximaDosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}
