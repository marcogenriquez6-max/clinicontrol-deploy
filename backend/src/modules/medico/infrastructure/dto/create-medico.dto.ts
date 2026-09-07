import { IsArray, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateMedicoDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  especialidades?: number[];

  @IsOptional()
  @IsNumber()
  especialidadId?: number;

  @IsString()
  consultorio?: string;

  @IsString()
  telefono?: string;

  @IsString()
  email?: string;

  @IsOptional()
  @IsNumber()
  codigoMedico?: number;

  @IsOptional()
  @IsNumber()
  sucursalId?: number;
}

export class UpdateMedicoDto {
  @IsString()
  nombre?: string;

  @IsString()
  apellido?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  especialidades?: number[];

  @IsOptional()
  @IsNumber()
  especialidadId?: number;

  @IsOptional()
  @IsString()
  consultorio?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsNumber()
  codigoMedico?: number;

  @IsOptional()
  @IsNumber()
  sucursalId?: number;
}