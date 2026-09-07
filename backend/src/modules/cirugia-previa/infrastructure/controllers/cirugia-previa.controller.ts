import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { CirugiaPreviaService } from '../../application/cirugia-previa.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateCirugiaPreviaDto } from '../dto/create-cirugia-previa.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Cirugías Previas')
@ApiBearerAuth()
@Controller('cirugias')
@Roles('medico')
export class CirugiaPreviaController {
  constructor(private readonly service: CirugiaPreviaService) {}

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Obtener cirugías previas de un paciente' })
  findByPaciente(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.service.findByPaciente(pacienteId);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nueva cirugía previa' })
  create(@Body(ValidationPipe) dto: CreateCirugiaPreviaDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar cirugía previa' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: Partial<CreateCirugiaPreviaDto>,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cirugía previa' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
