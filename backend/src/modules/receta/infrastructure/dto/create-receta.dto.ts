import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedicamentoItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  medicamentoId: number;

  @ApiProperty({ example: '1 tableta' })
  @IsString()
  @MinLength(1)
  dosis: string;

  @ApiProperty({ example: 'Cada 8 horas' })
  @IsString()
  @MinLength(1)
  frecuencia: string;

  @ApiPropertyOptional({ example: '7 dias' })
  @IsOptional()
  @IsString()
  duracion?: string;

  @ApiPropertyOptional({ example: 'Tomar despues de comer' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;
}

export class CreateRecetaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  consultaId: number;

  @ApiPropertyOptional({ example: 'Tomar con abundante agua' })
  @IsOptional()
  @IsString()
  instrucciones?: string;

  @ApiPropertyOptional({ type: [MedicamentoItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicamentoItemDto)
  medicamentos?: MedicamentoItemDto[];
}

export class UpdateRecetaDto {
  @ApiPropertyOptional({ example: 'Tomar con abundante agua' })
  @IsOptional()
  @IsString()
  instrucciones?: string;
}

export class DispensarItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  recetaMedicamentoId: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  cantidadDispensada: number;
}

export class DispensarRecetaDto {
  @ApiProperty({ type: [DispensarItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispensarItemDto)
  items: DispensarItemDto[];
}

export class AddMedicamentoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  medicamentoId: number;

  @ApiProperty({ example: '1 tableta' })
  @IsString()
  @MinLength(1)
  dosis: string;

  @ApiProperty({ example: 'Cada 8 horas' })
  @IsString()
  @MinLength(1)
  frecuencia: string;

  @ApiPropertyOptional({ example: '7 dias' })
  @IsOptional()
  @IsString()
  duracion?: string;

  @ApiPropertyOptional({ example: 'Tomar despues de comer' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;
}
