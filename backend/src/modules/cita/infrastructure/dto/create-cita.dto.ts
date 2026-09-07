import {
  IsString,
  IsDate,
  IsOptional,
  IsInt,
  MaxLength,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCitaDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  pacienteId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  medicoId: number;

  @ApiProperty({ example: '2025-06-15' })
  @Type(() => Date)
  @IsDate()
  fecha: Date;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @MaxLength(5)
  horaInicio: string;

  @ApiProperty({ example: '09:30' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  horaFin?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  especialidadId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  servicioId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoAtencionId?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  esVirtual?: boolean;

  @ApiPropertyOptional({ example: 'Consulta de control' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sucursalId?: number;

  @ApiPropertyOptional({ example: 'Traer estudios previos' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}

export class UpdateCitaDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pacienteId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicoId?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estadoId?: number;

  @ApiPropertyOptional({ example: '2025-06-16' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha?: Date;

  @ApiPropertyOptional({ example: '10:00' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  horaInicio?: string;

  @ApiPropertyOptional({ example: '10:30' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  horaFin?: string;

  @ApiPropertyOptional({ example: 'Consulta de control' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancelacionMotivo?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  especialidadId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  servicioId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoAtencionId?: number;
}

export class CitaQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pacienteId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicoId?: number;

  @ApiPropertyOptional({ example: '2025-06-15' })
  @IsOptional()
  @IsString()
  fecha?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estadoId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export interface CitaQuery {
  pacienteId?: number;
  medicoId?: number;
  fecha?: string;
  estadoId?: number;
  page?: number;
  limit?: number;
}
