import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsInt,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StrongPasswordValidator } from '../../../../common/validators/password.validator';
import { CiValidator } from '../../../../common/validators/ci.validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  apellido: string;

  @ApiProperty({ example: 'juan@hospital.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password1!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Validate(StrongPasswordValidator)
  password: string;

  @ApiPropertyOptional({ example: 'V-12345678' })
  @IsOptional()
  @IsString()
  @Validate(CiValidator)
  ci?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  rolId?: number;
}

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  apellido?: string;

  @ApiPropertyOptional({ example: 'juan@hospital.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Password1!' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Validate(StrongPasswordValidator)
  password?: string;

  @ApiPropertyOptional({ example: 'V-12345678' })
  @IsOptional()
  @IsString()
  @Validate(CiValidator)
  ci?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  rolId?: number;
}
