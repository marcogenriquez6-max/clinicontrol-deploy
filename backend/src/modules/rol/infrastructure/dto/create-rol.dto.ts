import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolDto {
  @ApiProperty({ example: 'ADMIN' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;
}

export class UpdateRolDto {
  @ApiProperty({ example: 'ADMIN' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;
}
