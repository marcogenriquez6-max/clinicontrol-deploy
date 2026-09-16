import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  IsNotEmpty,
  ValidateNested,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  DiagnosticoEntry,
  RecetaEntry,
} from './create-consulta-completa.dto';

export class ContinuarConsultaDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pacienteId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  medicoId?: number;

  @ApiProperty({ example: 'Persistencia de síntomas' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  motivoConsulta: string;

  @ApiProperty({ example: 'Dolor lumbar a la palpación' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(2000)
  sintomas: string;

  @ApiPropertyOptional({ example: 'Paciente refiere leve mejoría' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  enfermedadActual?: string;

  @ApiPropertyOptional({ example: 'PA: 120/80' })
  @IsOptional()
  @IsString()
  examenFisico?: string;

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

  @ApiPropertyOptional({ example: 98 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(50)
  @Max(100)
  saturacionOxigeno?: number;

  @ApiPropertyOptional({ example: 110 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(20)
  @Max(500)
  glucosaCapilar?: number;

  @ApiPropertyOptional({ example: 'Paciente con evolución favorable' })
  @IsOptional()
  @IsString()
  evaluacion?: string;

  @ApiPropertyOptional({ example: 'Continuar tratamiento' })
  @IsOptional()
  @IsString()
  planTratamiento?: string;

  @ApiPropertyOptional({ example: 'Control en 2 semanas' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  indicaciones?: string;

  @ApiProperty({ type: [DiagnosticoEntry] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosticoEntry)
  diagnosticos: DiagnosticoEntry[];

  @ApiPropertyOptional({ type: [RecetaEntry] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecetaEntry)
  recetas?: RecetaEntry[];

  @ApiPropertyOptional({ example: 'Paciente regresa por su control' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivoContinuacion?: string;
}