import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGrupoSanguineoDto {
  @ApiProperty({ example: 'O+' })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  nombre: string;
}

export class UpdateGrupoSanguineoDto {
  @ApiProperty({ example: 'O+' })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  nombre: string;
}
