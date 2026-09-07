import {
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  IsEnum,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  AdmisionEstado,
  BedStatus,
} from '../../../../entities/hospitalizacion.entity';

export class CreateHospitalizacionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  pacienteId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  medicoTratanteId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  camaId: number;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  fechaIngreso: Date;

  @ApiProperty({ example: 'Dolor abdominal agudo' })
  @IsString()
  @MinLength(5)
  motivoIngreso: string;

  @ApiPropertyOptional({ example: 'Apendicitis aguda' })
  @IsOptional()
  @IsString()
  diagnosticoIngreso?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdateHospitalizacionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  camaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  medicoTratanteId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notasAlta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosticoAlta?: string;

  @ApiPropertyOptional({ enum: AdmisionEstado })
  @IsOptional()
  @IsEnum(AdmisionEstado)
  estado?: AdmisionEstado;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaAlta?: Date;
}

export class DarAltaDto {
  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  fechaAlta: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notasAlta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosticoAlta?: string;
}

export class CreateCamaDto {
  @ApiProperty({ example: 'CAMA-101' })
  @IsString()
  codigoCama: string;

  @ApiProperty({ example: 'Urgencias' })
  @IsString()
  servicio: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  piso?: string;

  @ApiPropertyOptional({ example: '101' })
  @IsOptional()
  @IsString()
  habitacion?: string;

  @ApiPropertyOptional({ enum: BedStatus })
  @IsOptional()
  @IsEnum(BedStatus)
  estado?: BedStatus;
}

export class UpdateCamaDto {
  @ApiPropertyOptional({ enum: BedStatus })
  @IsOptional()
  @IsEnum(BedStatus)
  estado?: BedStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigoCama?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  servicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  piso?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  habitacion?: string;
}

export class CreateNotaEvolucionHospitalizacionDto {
  @ApiProperty({ example: '2026-09-05', description: 'Fecha de la evolución (YYYY-MM-DD, día local)' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fecha debe tener formato YYYY-MM-DD' })
  fecha: string;

  @ApiProperty({ example: 'Paciente evoluciona favorablemente...' })
  @IsString()
  @MinLength(10)
  nota: string;

  @ApiPropertyOptional({ example: 'Continuar con tratamiento antibiótico' })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiPropertyOptional({ example: 'Signos vitales cada 4 horas' })
  @IsOptional()
  @IsString()
  indicaciones?: string;
}

export class HospitalizacionQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AdmisionEstado)
  estado?: AdmisionEstado;

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
