import {
  IsString,
  Matches,
  IsInt,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { MetodoPago } from '../../../../entities/turno.entity';

export class CreateTurnoDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  pacienteId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  medicoId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  citaId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoAtencionId?: number;

  @ApiPropertyOptional({ example: 'Consulta Médica' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  consultorio?: string;

  @ApiPropertyOptional({ example: '2026-08-24' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fechaProgramada debe tener formato YYYY-MM-DD',
  })
  fechaProgramada?: string;

  @ApiPropertyOptional({ example: '10:30' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'horaProgramada debe tener formato HH:mm',
  })
  horaProgramada?: string;

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monto: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  pagado?: boolean;

  @ApiPropertyOptional({ enum: MetodoPago, example: MetodoPago.EFECTIVO })
  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;
}

export class UpdateTurnoEstadoDto {
  @ApiProperty({
    enum: ['llamado', 'atencion', 'completado', 'cancelado', 'no_asistio'],
  })
  @IsString()
  estado: string;
}

export class MarcarPagadoDto {
  @ApiPropertyOptional({ enum: MetodoPago, example: MetodoPago.EFECTIVO })
  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;
}

export class TurnoQueryDto {
  @ApiPropertyOptional({ description: 'Uno o varios estados separados por coma' })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicoId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pacienteId?: number;

  @ApiPropertyOptional({ example: '2025-06-15', description: 'Día de emisión' })
  @IsOptional()
  @IsString()
  fecha?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' || value === true
      ? true
      : value === 'false' || value === false
        ? false
        : undefined,
  )
  @IsBoolean()
  pagado?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;
}
