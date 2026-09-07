import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  IsNotEmpty,
  ArrayNotEmpty,
  ValidateNested,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DiagnosticoEntry {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cie10Id?: number;

  @ApiProperty({ example: 'Hipertensión esencial' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  descripcion: string;

  @ApiProperty({ enum: ['principal', 'secundario', 'complicacion', 'cronico'] })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['principal', 'secundario', 'complicacion', 'cronico'])
  tipo: 'principal' | 'secundario' | 'complicacion' | 'cronico';

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  esCronico?: boolean;

  constructor() {
    this.esCronico = false;
  }
}

export class RecetaEntry {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  medicamentoId: number;

  @ApiProperty({ example: '1 tableta' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  dosis: string;

  @ApiProperty({ example: 'Cada 8 horas' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  frecuencia: string;

  @ApiPropertyOptional({ example: '7 días' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  duracion?: string;

  @ApiProperty({ example: 21 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number;

  @ApiPropertyOptional({ example: 'Tomar después de comer' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}

export class CreateConsultaCompletaDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pacienteId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  medicoId: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  citaId?: number;

  @ApiProperty({ example: 'Dolor de cabeza persistente hace 3 días' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  motivoConsulta: string;

  @ApiProperty({ example: 'Cefalea frontal bilateral, fotofobia leve' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(2000)
  sintomas: string;

  @ApiPropertyOptional({ example: 'Paciente refiere dolor desde hace 3 días' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  enfermedadActual?: string;

  @ApiPropertyOptional({ example: 'PA: 130/85, FC: 72' })
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

  @ApiPropertyOptional({ example: 'Paciente con probable HTA' })
  @IsOptional()
  @IsString()
  evaluacion?: string;

  @ApiPropertyOptional({ example: 'Iniciar Enalapril 5mg' })
  @IsOptional()
  @IsString()
  planTratamiento?: string;

  @ApiPropertyOptional({ example: 'Reposo 48h, control en 1 semana' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  indicaciones?: string;

  @ApiProperty({ type: [DiagnosticoEntry] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DiagnosticoEntry)
  diagnosticos: DiagnosticoEntry[];

  @ApiPropertyOptional({ type: [RecetaEntry] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecetaEntry)
  recetas?: RecetaEntry[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  esContinuacion?: boolean;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  consultaOriginalId?: number;

  @ApiPropertyOptional({
    example: 'Paciente regresa por persistencia de síntomas',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivoContinuacion?: string;
}
