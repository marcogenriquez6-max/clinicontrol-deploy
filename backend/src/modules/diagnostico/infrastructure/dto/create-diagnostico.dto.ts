import { IsString, IsInt, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDiagnosticoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  consultaId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  cie10Id: number;

  @ApiProperty({ example: 'Hipertensión esencial diagnosticada' })
  @IsString()
  @MinLength(3)
  descripcion: string;

  @ApiPropertyOptional({ example: 'Controlar presión arterial mensualmente' })
  @IsOptional()
  @IsString()
  recomendaciones?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  es_cronico?: boolean;
}

export class UpdateDiagnosticoDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  cie10Id?: number;

  @ApiPropertyOptional({ example: 'Hipertensión esencial diagnosticada' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  descripcion?: string;

  @ApiPropertyOptional({ example: 'Controlar presión arterial mensualmente' })
  @IsOptional()
  @IsString()
  recomendaciones?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  es_cronico?: boolean;
}
