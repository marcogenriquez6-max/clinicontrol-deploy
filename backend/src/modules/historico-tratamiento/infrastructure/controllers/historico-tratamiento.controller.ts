import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HistoricoTratamientoService } from '../../application/historico-tratamiento.service';
import { CreateHistoricoTratamientoDto } from '../dto/create-historico-tratamiento.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Ownership } from '../../../../common/decorators/ownership.decorator';
import { OwnershipGuard } from '../../../../common/guards/ownership.guard';

@ApiTags('Histórico de Tratamientos')
@ApiBearerAuth()
@Controller('historico-tratamiento')
@Roles('medico')
export class HistoricoTratamientoController {
  constructor(private readonly service: HistoricoTratamientoService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros de tratamiento' })
  findAll() {
    return this.service.findAll();
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Obtener histórico de tratamientos de un paciente' })
  @Ownership('record')
  @UseGuards(OwnershipGuard)
  findByPaciente(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.service.findByPaciente(pacienteId);
  }

  @Get('paciente/:pacienteId/activos')
  @ApiOperation({ summary: 'Obtener tratamientos activos de un paciente' })
  @Ownership('record')
  @UseGuards(OwnershipGuard)
  findActivos(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.service.findActivos(pacienteId);
  }

  @Get('paciente/:pacienteId/timeline')
  @ApiOperation({ summary: 'Obtener línea de tiempo completa de tratamientos' })
  @Ownership('record')
  @UseGuards(OwnershipGuard)
  getTimeline(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.service.getTimeline(pacienteId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear registro de tratamiento' })
  create(@Body() dto: CreateHistoricoTratamientoDto) {
    return this.service.create(dto);
  }

  @Put(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado de un tratamiento' })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: string; motivoCambio?: string },
  ) {
    return this.service.updateEstado(id, body.estado, body.motivoCambio);
  }
}
