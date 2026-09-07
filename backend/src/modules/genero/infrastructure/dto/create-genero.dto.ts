import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGeneroDto {
  @ApiProperty({ example: 'Masculino' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;
}

export class UpdateGeneroDto {
  @ApiProperty({ example: 'Masculino' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;
}
