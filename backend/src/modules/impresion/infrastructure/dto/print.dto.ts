import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedicamentoDto {
  @ApiProperty({ example: 'Amoxicilina' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: '500 mg cápsulas' })
  @IsString()
  presentacion: string;

  @ApiProperty({ example: '1 cápsula cada 8 horas' })
  @IsString()
  dosis: string;

  @ApiProperty({ example: 'Cada 8 horas' })
  @IsString()
  frecuencia: string;

  @ApiProperty({ example: '7 días' })
  @IsString()
  duracion: string;

  @ApiPropertyOptional({ example: 'Tomar con alimentos' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class PrintRecetaDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  paciente: string;

  @ApiProperty({ example: 'Dr. García' })
  @IsString()
  medico: string;

  @ApiProperty({ example: 'MED-001' })
  @IsString()
  codigoMedico: string;

  @ApiProperty({ type: [MedicamentoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicamentoDto)
  medicamentos: MedicamentoDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class PrintCertificadoDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  paciente: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  identificacion: string;

  @ApiProperty({ example: 'Dr. García' })
  @IsString()
  medico: string;

  @ApiProperty({ example: 'MED-001' })
  @IsString()
  codigoMedico: string;

  @ApiProperty({ example: 'Paciente apto para realizar actividad física' })
  @IsString()
  contenido: string;

  @ApiProperty({ example: 'Certificado de Salud' })
  @IsString()
  tipo: string;
}

export class PrintEpicrisisDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  paciente: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  identificacion: string;

  @ApiProperty({ example: 'Dr. García' })
  @IsString()
  medico: string;

  @ApiProperty({ example: 'MED-001' })
  @IsString()
  codigoMedico: string;

  @ApiProperty({ example: '2025-01-01' })
  @IsString()
  fechaIngreso: string;

  @ApiProperty({ example: '2025-01-15' })
  @IsString()
  fechaAlta: string;

  @ApiProperty({ example: 'Neumonía adquirida en la comunidad' })
  @IsString()
  diagnosticoIngreso: string;

  @ApiProperty({ example: 'Neumonía - Resuelta' })
  @IsString()
  diagnosticoEgreso: string;

  @ApiProperty({
    example:
      'Tratamiento antibiótico completado. Paciente evoluciona favorablemente.',
  })
  @IsString()
  resumen: string;

  @ApiProperty({ example: 'Control en 7 días' })
  @IsString()
  recomendaciones: string;
}

export class PrintHistoriaClinicaDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  paciente: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  identificacion: string;

  @ApiProperty({ example: '01/01/1980' })
  @IsString()
  fechaNacimiento: string;

  @ApiProperty({ example: 'Masculino' })
  @IsString()
  genero: string;

  @ApiProperty({ example: 'O+' })
  @IsString()
  grupoSanguineo: string;

  @ApiProperty({ example: ['Hipertensión arterial', 'Diabetes tipo 2'] })
  @IsArray()
  @IsString({ each: true })
  antecedentes: string[];

  @ApiProperty({
    type: [Object],
    example: [
      { fecha: '2025-01-01', diagnostico: 'Neumonía', medico: 'Dr. García' },
    ],
  })
  @IsArray()
  consultas: Record<string, any>[];
}
