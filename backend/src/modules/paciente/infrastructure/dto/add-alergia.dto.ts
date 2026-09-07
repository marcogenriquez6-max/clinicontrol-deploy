import { IsInt, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddAlergiaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  alergiaId: number;

  @ApiPropertyOptional({ example: 'leve' })
  @IsString()
  @IsOptional()
  severidad?: string;
}
