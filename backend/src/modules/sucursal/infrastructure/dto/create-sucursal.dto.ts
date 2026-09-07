import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSucursalDto {
  @ApiProperty({ example: 'Clínica Central' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  nombre: string;

  @ApiPropertyOptional({ example: 'Calle Principal #123' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccion?: string;

  @ApiPropertyOptional({ example: '809-555-0100' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @ApiPropertyOptional({ example: 'info@clinica.com' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string;

  @ApiPropertyOptional({ example: '123-456-789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  rnc?: string;
}

export class UpdateSucursalDto {
  @ApiPropertyOptional({ example: 'Clínica Central' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Calle Principal #123' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccion?: string;

  @ApiPropertyOptional({ example: '809-555-0100' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @ApiPropertyOptional({ example: 'info@clinica.com' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string;

  @ApiPropertyOptional({ example: '123-456-789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  rnc?: string;
}
