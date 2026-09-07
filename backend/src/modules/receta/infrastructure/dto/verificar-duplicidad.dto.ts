import { IsInt, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerificarDuplicidadDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  pacienteId: number;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @IsInt({ each: true })
  medicamentoIds: number[];
}
