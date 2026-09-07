import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsBoolean,
  IsInt,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateServicioDto {
  @ApiProperty({ example: 'Papanicolaou' })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  nombre: string;

  @ApiPropertyOptional({ example: 'Citología cervical para detección de cáncer' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  especialidadId: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(480)
  duracionMinutos?: number = 30;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monto?: number = 0;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  requierePreparacion?: boolean = false;

  @ApiPropertyOptional({ example: 'No tener relaciones sexuales 48h antes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  preparacionInstrucciones?: string;
}

export class UpdateServicioDto {
  @ApiPropertyOptional({ example: 'Papanicolaou' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Citología cervical' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  especialidadId?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(480)
  duracionMinutos?: number;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monto?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  requierePreparacion?: boolean;

  @ApiPropertyOptional({ example: 'No tener relaciones 48h antes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  preparacionInstrucciones?: string;
}

export class ServicioQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  especialidadId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}

export interface ServicioQuery {
  especialidadId?: number;
  activo?: boolean;
  page?: number;
  limit?: number;
}