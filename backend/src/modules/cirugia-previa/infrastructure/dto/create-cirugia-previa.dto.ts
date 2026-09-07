import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCirugiaPreviaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  pacienteId: number;

  @ApiProperty({ example: 'Apendicectomía' })
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  nombreProcedimiento: string;

  @ApiPropertyOptional({ example: '2020-05-15' })
  @IsOptional()
  @IsDateString()
  fechaCirugia?: string;

  @ApiPropertyOptional({ example: 'Hospital San Juan de Dios' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  hospital?: string;

  @ApiPropertyOptional({ example: 'Dr. Carlos Méndez' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  medicoCirujano?: string;

  @ApiPropertyOptional({ example: 'General' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipoAnestesia?: string;

  @ApiPropertyOptional({ example: 'Infección postoperatoria' })
  @IsOptional()
  @IsString()
  complicaciones?: string;

  @ApiPropertyOptional({ example: 'Paciente toleró bien el procedimiento' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
