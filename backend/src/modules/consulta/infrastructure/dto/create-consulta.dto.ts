import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsObject,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateConsultaDto {
  @ApiPropertyOptional({ example: '2026-05-08' })
  @IsOptional()
  @IsString()
  fecha?: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  pacienteId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  medicoId: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  citaId?: number;

  @ApiPropertyOptional({ example: 'consulta_general' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipoConsulta?: string;

  @ApiProperty({ example: 'Dolor de cabeza persistente hace 3 días' })
  @IsString()
  motivo: string;

  @ApiProperty({ example: 'Cefalea frontal bilateral, fotofobia leve' })
  @IsString()
  sintomas: string;

  @ApiProperty({ example: 'PA: 130/85, FC: 72, T: 36.5°C, SO2: 98%' })
  @IsString()
  examenFisico: string;

  @ApiPropertyOptional({
    example: {
      presion_arterial: '130/85',
      frecuencia_cardiaca: 72,
      temperatura: 36.5,
      saturacion_o2: 98,
      frecuencia_respiratoria: 18,
    },
  })
  @IsOptional()
  @IsObject()
  signosVitales?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 75.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  peso?: number;

  @ApiPropertyOptional({ example: 1.75 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  talla?: number;

  @ApiPropertyOptional({ example: 36.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(45)
  temperatura?: number;

  @ApiPropertyOptional({ example: 130 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(50)
  @Max(250)
  presionArterialSistolica?: number;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(150)
  presionArterialDiastolica?: number;

  @ApiPropertyOptional({ example: 72 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(220)
  frecuenciaCardiaca?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(8)
  @Max(40)
  frecuenciaRespiratoria?: number;

  @ApiPropertyOptional({ example: 'Se indica reposo y paracetamol' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdateConsultaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sintomas?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  enfermedadActual?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  examenFisico?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evaluacion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planTratamiento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  signosVitales?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  peso?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  talla?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  temperatura?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  presionArterialSistolica?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  presionArterialDiastolica?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  frecuenciaCardiaca?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  frecuenciaRespiratoria?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  indicaciones?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  saturacionOxigeno?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  glucosaCapilar?: number;
}

export class SignosVitalesDto {
  @ApiPropertyOptional({ example: '130/85' })
  @IsOptional()
  @IsString()
  presion_arterial?: string;

  @ApiPropertyOptional({ example: 72 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  frecuencia_cardiaca?: number;

  @ApiPropertyOptional({ example: 36.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  temperatura?: number;

  @ApiPropertyOptional({ example: 98 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  saturacion_o2?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  frecuencia_respiratoria?: number;
}
