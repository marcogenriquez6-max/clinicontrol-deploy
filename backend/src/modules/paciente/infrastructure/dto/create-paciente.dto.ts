import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SanitizarTexto,
  FechaNoFutura,
} from '../../../../common/validators/sanitizar';

export class CreatePacienteDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @SanitizarTexto()
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @SanitizarTexto()
  apellido: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(20)
  @SanitizarTexto()
  ci: string;

  @ApiProperty({ example: '1990-05-15' })
  @IsDateString()
  @FechaNoFutura()
  fechaNacimiento: Date;

  @ApiProperty({ example: 1 })
  @IsInt()
  generoId: number;

  @ApiPropertyOptional({ example: '+591 77712345' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Calle Bolívar #123' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({ example: 'juan.perez@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  grupoSanguineoId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  sucursalId?: number;

  @ApiPropertyOptional({ example: 'Cardiología' })
  @IsString()
  @IsOptional()
  especialidad?: string;

  @ApiPropertyOptional({ example: 'María Pérez (madre)' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  contactoEmergenciaNombre?: string;

  @ApiPropertyOptional({ example: '+591 71234567' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  contactoEmergenciaTelefono?: string;
}

export class UpdatePacienteDto {
  @ApiPropertyOptional({ example: 'Juan Carlos' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @SanitizarTexto()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Pérez García' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @SanitizarTexto()
  apellido?: string;

  @ApiPropertyOptional({ example: '87654321' })
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(20)
  @SanitizarTexto()
  ci?: string;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsDateString()
  @FechaNoFutura()
  @IsOptional()
  fechaNacimiento?: Date;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @IsOptional()
  generoId?: number;

  @ApiPropertyOptional({ example: '+591 77754321' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Av. 6 de Agosto #456' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({ example: 'juanc.perez@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @IsOptional()
  grupoSanguineoId?: number;

  @ApiPropertyOptional({ example: 'activo' })
  @IsString()
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({ example: 'Cardiología' })
  @IsString()
  @IsOptional()
  especialidad?: string;

  @ApiPropertyOptional({ example: 'María Pérez (madre)' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  contactoEmergenciaNombre?: string;

  @ApiPropertyOptional({ example: '+591 71234567' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  contactoEmergenciaTelefono?: string;
}

export class PacienteQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;
}
