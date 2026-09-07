import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegistrarPagoDto {
  @ApiPropertyOptional({ example: 12, description: 'Turno que se paga (opcional)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  turnoId?: number;

  @ApiPropertyOptional({ example: 3, description: 'Paciente (obligatorio si no hay turno)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pacienteId?: number;

  @ApiPropertyOptional({ example: 'Consulta General' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  concepto?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monto?: number;

  @ApiPropertyOptional({ example: 'Pago en ventanilla' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}

export class AnularPagoDto {
  @ApiProperty({ example: 'Cobro duplicado' })
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  motivo: string;
}

export class PagoQueryDto {
  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @ApiPropertyOptional({ example: '2026-09-30' })
  @IsOptional()
  @IsString()
  fechaFin?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pacienteId?: number;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'pagado' })
  @IsOptional()
  @IsString()
  estado?: string;

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
