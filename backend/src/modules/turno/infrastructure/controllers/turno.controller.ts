import {
  Controller,
  Get,
  Post,
  Put,
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
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TurnoService } from '../../application/turno.service';
import {
  CreateTurnoDto,
  UpdateTurnoEstadoDto,
  TurnoQueryDto,
} from '../dto/create-turno.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

type Usuario = { id: number; rol: string; email: string };

const ADMISION = ['recepcionista', 'secretaria'] as const;
const LECTURA = ['recepcionista', 'secretaria', 'medico', 'enfermeria', 'gerente'] as const;

@ApiTags('Turnos')
@ApiBearerAuth()
@Controller('turnos')
export class TurnoController {
  constructor(private readonly turnoService: TurnoService) {}

  @Get()
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar turnos con filtros (el médico solo ve los suyos)' })
  findAll(@Query() query: TurnoQueryDto, @CurrentUser() user: Usuario) {
    return this.turnoService.findAll(query, user);
  }

  @Get('hoy')
  @Roles(...LECTURA)
  @ApiOperation({
    summary:
      'Agenda del día: turnos emitidos hoy (el médico solo los suyos, con marca de urgencia)',
  })
  @ApiQuery({ name: 'fecha', required: false, example: '2026-09-05' })
  agendaDelDia(@CurrentUser() user: Usuario, @Query('fecha') fecha?: string) {
    return this.turnoService.agendaDelDia(user, fecha || undefined);
  }

  @Get('tv')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Obtener turnos activos para pantalla de sala' })
  getTV() {
    return this.turnoService.getTV();
  }

  @Get(':id')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Obtener turno por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.turnoService.findOne(id);
  }

  @Post()
  @Roles(...ADMISION)
  @ApiOperation({ summary: 'Generar nuevo turno (A001, A002, ...)' })
  @ApiResponse({ status: 201, description: 'Turno creado' })
  create(@Body(ValidationPipe) dto: CreateTurnoDto, @CurrentUser() user: Usuario) {
    return this.turnoService.create(dto, user);
  }

  @Put(':id/estado')
  @Roles('recepcionista', 'secretaria', 'medico', 'enfermeria')
  @ApiOperation({ summary: 'Actualizar estado de turno' })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateTurnoEstadoDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.turnoService.updateEstado(id, dto.estado, user);
  }

  @Delete(':id')
  @Roles(...ADMISION)
  @ApiOperation({ summary: 'Eliminar turno emitido por error' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.turnoService.remove(id);
  }
}
