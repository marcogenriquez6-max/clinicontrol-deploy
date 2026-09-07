import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlergiaSeveridad } from '../../../../entities/alergia.entity';

export class CreateAlergiaDto {
  @ApiProperty({ example: 'Penicilina' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nombre: string;

  @ApiPropertyOptional({
    example: 'Reacción alérgica a antibióticos betalactámicos',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    enum: AlergiaSeveridad,
    example: AlergiaSeveridad.MODERADA,
  })
  @IsOptional()
  @IsEnum(AlergiaSeveridad)
  severidad?: AlergiaSeveridad;
}

export class UpdateAlergiaDto {
  @ApiPropertyOptional({ example: 'Penicilina' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Reacción alérgica a antibióticos betalactámicos',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    enum: AlergiaSeveridad,
    example: AlergiaSeveridad.MODERADA,
  })
  @IsOptional()
  @IsEnum(AlergiaSeveridad)
  severidad?: AlergiaSeveridad;
}
