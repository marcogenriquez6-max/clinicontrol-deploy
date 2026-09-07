import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArqueoDto {
  @ApiProperty({ example: 2500 })
  @IsNumber()
  @Min(0)
  montoEsperado: number;

  @ApiProperty({ example: 2480 })
  @IsNumber()
  @Min(0)
  montoReal: number;

  @ApiPropertyOptional({ example: 'Faltante de Bs. 20' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  usuarioId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  cajaSessionId?: number;
}
