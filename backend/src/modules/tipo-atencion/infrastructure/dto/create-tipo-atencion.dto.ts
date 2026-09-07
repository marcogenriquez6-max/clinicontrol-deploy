import {
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoAtencionTipo } from '../../../../entities/tipo-atencion.entity';

export class CreateTipoAtencionDto {
  @ApiProperty({ example: 'Consulta Médica' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ enum: TipoAtencionTipo, example: TipoAtencionTipo.CONSULTA_NUEVA })
  @IsEnum(TipoAtencionTipo)
  tipo: TipoAtencionTipo;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(5)
  duracionMinutos: number = 30;

  @ApiProperty({ example: 200 })
  @IsNumber()
  @Min(0)
  monto: number = 0;
}

export class UpdateTipoAtencionDto {
  @ApiPropertyOptional({ example: 'Consulta Médica' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ enum: TipoAtencionTipo, example: TipoAtencionTipo.CONSULTA_NUEVA })
  @IsOptional()
  @IsEnum(TipoAtencionTipo)
  tipo?: TipoAtencionTipo;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  duracionMinutos?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monto?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
