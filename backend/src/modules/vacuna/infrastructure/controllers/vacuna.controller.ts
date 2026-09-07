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
import { VacunaService } from '../../application/vacuna.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  CreateVacunaDto,
  UpdateVacunaDto,
  AplicarVacunaDto,
} from '../dto/create-vacuna.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Vacunas')
@ApiBearerAuth()
@Controller('vacunas')
@Roles('medico', 'enfermeria')
export class VacunaController {
  constructor(private readonly vacunaService: VacunaService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las vacunas activas' })
  findAll() {
    return this.vacunaService.getAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar vacunas por nombre o descripción' })
  search(@Query('q') query?: string) {
    return this.vacunaService.search(query || '');
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Obtener vacunas aplicadas a un paciente' })
  getByPacienteId(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.vacunaService.getAplicacionesByPacienteId(pacienteId);
  }

  @Get('paciente/:pacienteId/calendario')
  @ApiOperation({ summary: 'Obtener calendario de vacunación de un paciente' })
  getCalendario(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.vacunaService.getCalendarioByPacienteId(pacienteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener vacuna por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vacunaService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva vacuna en el catálogo' })
  create(@Body(ValidationPipe) dto: CreateVacunaDto) {
    return this.vacunaService.create(dto);
  }

  @Post('aplicar')
  @ApiOperation({ summary: 'Aplicar una vacuna a un paciente' })
  aplicarVacuna(@Body(ValidationPipe) dto: AplicarVacunaDto) {
    return this.vacunaService.aplicarVacuna(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar vacuna del catálogo' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateVacunaDto,
  ) {
    return this.vacunaService.update(id, dto);
  }

  @Delete('aplicacion/:id')
  @ApiOperation({ summary: 'Eliminar una aplicación de vacuna' })
  removeAplicacion(@Param('id', ParseIntPipe) id: number) {
    return this.vacunaService.removeAplicacion(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar vacuna del catálogo' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.vacunaService.delete(id);
  }
}
