import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsNumber,
  IsEnum,
  IsDate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ESILevel, TriageEstado } from '../../../../entities/triage.entity';

export class CreateTriageDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  pacienteId: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  @Max(5)
  esiNivel: ESILevel;

  @ApiPropertyOptional({ example: 36.5 })
  @IsOptional()
  @IsNumber()
  temperatura?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(280)
  frecuenciaCardiaca?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(280)
  presionSistolica?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(160)
  presionDiastolica?: number;

  @ApiPropertyOptional({ example: 16 })
  @IsOptional()
  @IsInt()
  @Min(4)
  @Max(80)
  frecuenciaRespiratoria?: number;

  @ApiPropertyOptional({ example: 98 })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(100)
  spo2?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(15)
  glasgow?: number;

  @ApiPropertyOptional({ example: 70.5 })
  @IsOptional()
  @IsNumber()
  peso?: number;

  @ApiPropertyOptional({ example: 170 })
  @IsOptional()
  @IsNumber()
  talla?: number;

  @ApiPropertyOptional({ example: 'Dolor abdominal intenso' })
  @IsOptional()
  @IsString()
  motivoConsulta?: string;

  @ApiPropertyOptional({ example: 'Penicilina' })
  @IsOptional()
  @IsString()
  alergias?: string;

  @ApiPropertyOptional({ example: 'Losartán 50mg' })
  @IsOptional()
  @IsString()
  medicamentosActuales?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdateTriageDto {
  @ApiPropertyOptional({ enum: TriageEstado })
  @IsOptional()
  @IsEnum(TriageEstado)
  estado?: TriageEstado;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  atendidoPorId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaAtencion?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class TriageQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TriageEstado)
  estado?: TriageEstado;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pacienteId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 20;
}
