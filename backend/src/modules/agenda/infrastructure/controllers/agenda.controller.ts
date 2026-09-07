import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AgendaService } from '../../application/agenda.service';
import {
  CreateHorarioMedicoDto,
  BloquearFechaDto,
} from '../dto/horario-medico.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Agenda Inteligente')
@ApiBearerAuth()
@Controller('agenda')
@Roles('admin', 'medico', 'recepcionista', 'secretaria')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get('medico/:medicoId/horarios')
  @ApiOperation({ summary: 'Obtener horarios semanales del médico' })
  getHorarios(@Param('medicoId', ParseIntPipe) medicoId: number) {
    return this.agendaService.getHorarios(medicoId);
  }

  @Post('medico/:medicoId/horarios')
  @ApiOperation({ summary: 'Crear o actualizar horario del médico' })
  setHorario(
    @Param('medicoId', ParseIntPipe) medicoId: number,
    @Body(ValidationPipe) dto: CreateHorarioMedicoDto,
  ) {
    return this.agendaService.setHorario(medicoId, dto);
  }

  @Delete('horarios/:id')
  @ApiOperation({ summary: 'Eliminar horario' })
  deleteHorario(@Param('id', ParseIntPipe) id: number) {
    return this.agendaService.deleteHorario(id);
  }

  @Get('medico/:medicoId/slots')
  @ApiOperation({ summary: 'Obtener slots disponibles para una fecha' })
  @ApiQuery({ name: 'fecha', example: '2026-06-15' })
  getSlots(
    @Param('medicoId', ParseIntPipe) medicoId: number,
    @Query('fecha') fecha: string,
  ) {
    return this.agendaService.getSlotsDisponibles(medicoId, fecha);
  }

  @Get('medico/:medicoId/agenda')
  @ApiOperation({ summary: 'Obtener agenda completa del médico en una fecha' })
  @ApiQuery({ name: 'fecha', example: '2026-06-15' })
  getAgenda(
    @Param('medicoId', ParseIntPipe) medicoId: number,
    @Query('fecha') fecha: string,
  ) {
    return this.agendaService.getAgendaMedico(medicoId, fecha);
  }

  @Post('medico/:medicoId/bloqueos')
  @ApiOperation({ summary: 'Bloquear fechas (vacaciones, personal)' })
  bloquear(
    @Param('medicoId', ParseIntPipe) medicoId: number,
    @Body(ValidationPipe) dto: BloquearFechaDto,
  ) {
    return this.agendaService.bloquearFecha(medicoId, dto);
  }

  @Get('medico/:medicoId/bloqueos')
  @ApiOperation({ summary: 'Obtener bloqueos del médico' })
  getBloqueos(@Param('medicoId', ParseIntPipe) medicoId: number) {
    return this.agendaService.getBloqueos(medicoId);
  }

  @Delete('bloqueos/:id')
  @ApiOperation({ summary: 'Eliminar bloqueo' })
  deleteBloqueo(@Param('id', ParseIntPipe) id: number) {
    return this.agendaService.eliminarBloqueo(id);
  }
}
