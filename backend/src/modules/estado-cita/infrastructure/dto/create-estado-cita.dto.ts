import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEstadoCitaDto {
  @ApiProperty({ example: 'pendiente' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  nombre: string;
}

export class UpdateEstadoCitaDto {
  @ApiProperty({ example: 'pendiente' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  nombre: string;
}
