import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  IsBoolean,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StrongPasswordValidator } from '../../../../common/validators/password.validator';
import { CiValidator } from '../../../../common/validators/ci.validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@hospital.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: false,
    required: false,
    description:
      'Extiende la vigencia del refresh token (30 días en vez de 7).',
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class RegisterDto {
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

  @ApiProperty({ example: 'V-12345678', required: false })
  @IsOptional()
  @IsString()
  @Validate(CiValidator)
  ci?: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Validate(StrongPasswordValidator)
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'admin@hospital.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123...' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Validate(StrongPasswordValidator)
  newPassword: string;
}
