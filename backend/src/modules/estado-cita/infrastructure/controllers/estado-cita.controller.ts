import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EstadoCitaService } from '../../application/estado-cita.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Estados de Cita')
@ApiBearerAuth()
@Controller('estados-cita')
@Roles('admin', 'medico', 'recepcionista', 'secretaria')
export class EstadoCitaController {
  constructor(private readonly estadoCitaService: EstadoCitaService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los estados de cita' })
  findAll() {
    return this.estadoCitaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estado de cita por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estadoCitaService.findOne(id);
  }
}
