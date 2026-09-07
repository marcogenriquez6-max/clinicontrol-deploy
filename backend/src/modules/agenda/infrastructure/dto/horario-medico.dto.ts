import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BloqueoAgendaTipo } from '../../../../entities/bloqueo-agenda.entity';

export class CreateHorarioMedicoDto {
  @ApiProperty({ example: 0, description: '0=Domingo, 1=Lunes...6=Sábado' })
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaInicio: string;

  @ApiProperty({ example: '12:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaFin: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaInicioTarde?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaFinTarde?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(5)
  duracionSlotMinutos?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  activo?: boolean;
}

export class BloquearFechaDto {
  @ApiProperty({ example: '2026-06-15' })
  @IsString()
  @IsNotEmpty()
  fechaInicio: string;

  @ApiProperty({ example: '2026-06-20' })
  @IsString()
  @IsNotEmpty()
  fechaFin: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaInicio?: string;

  @ApiPropertyOptional({ example: '12:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaFin?: string;

  @ApiPropertyOptional({ enum: BloqueoAgendaTipo, example: BloqueoAgendaTipo.AUSENCIA_COMPLETA })
  @IsOptional()
  @IsEnum(BloqueoAgendaTipo)
  tipo?: BloqueoAgendaTipo = BloqueoAgendaTipo.AUSENCIA_COMPLETA;

  @ApiProperty({ example: 'Vacaciones' })
  @IsString()
  @IsNotEmpty()
  motivo: string;
}

export class SlotDisponibleDto {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  estado?: string;
}
