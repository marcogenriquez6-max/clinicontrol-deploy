import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AbrirSesionDto {
  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  montoInicial: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  usuarioId: number;
}

export class CerrarSesionDto {
  @ApiProperty({ example: 2500 })
  @IsNumber()
  @Min(0)
  montoFinal: number;

  @ApiPropertyOptional({ example: 'Cierre sin novedades' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class CobrarDto {
  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  montoRecibido: number;
}
