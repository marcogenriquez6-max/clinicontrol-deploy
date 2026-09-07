import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEspecialidadDto {
  @ApiProperty({ example: 'Cardiología' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre: string;
}

export class UpdateEspecialidadDto {
  @ApiPropertyOptional({ example: 'Cardiología' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre?: string;
}
