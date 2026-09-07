import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Ownership } from '../../../../common/decorators/ownership.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { OwnershipGuard } from '../../../../common/guards/ownership.guard';
import { PacienteService } from '../../application/paciente.service';
import {
  CreatePacienteDto,
  UpdatePacienteDto,
  PacienteQueryDto,
} from '../dto/create-paciente.dto';
import { AddAlergiaDto } from '../dto/add-alergia.dto';

@ApiTags('Pacientes')
@ApiBearerAuth()
@Controller('pacientes')
export class PacienteController {
  constructor(private readonly pacienteService: PacienteService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pacientes con paginación y búsqueda' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de pacientes' })
  @Roles('recepcionista', 'secretaria', 'medico', 'enfermeria')
  findAll(@Query(ValidationPipe) query: PacienteQueryDto) {
    return this.pacienteService.findAll(query);
  }

  @Get('buscar')
  @Roles('recepcionista', 'secretaria', 'medico', 'enfermeria')
  @ApiOperation({ summary: 'Buscar pacientes por texto completo' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Término de búsqueda (nombre, CI, teléfono)',
  })
  @ApiResponse({ status: 200, description: 'Pacientes encontrados' })
  buscarPacientes(@Query('q') query: string) {
    return this.pacienteService.buscarPacientes(query);
  }

  @Get('ci/:ci')
  @ApiOperation({ summary: 'Buscar paciente por cédula' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado' })
  @Roles('recepcionista', 'secretaria', 'medico', 'enfermeria')
  findByCi(@Param('ci') ci: string) {
    return this.pacienteService.findByCi(ci);
  }

  @Get(':id')
  @Ownership('patient')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Obtener paciente por ID' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  @Roles('recepcionista', 'secretaria', 'medico', 'enfermeria')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pacienteService.findOne(id);
  }

  @Get(':id/historia-clinica')
  @Ownership('patient')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Historia clínica completa del paciente' })
  @ApiResponse({ status: 200, description: 'Historia clínica' })
  getHistoriaClinica(@Param('id', ParseIntPipe) id: number) {
    return this.pacienteService.getHistoriaClinica(id);
  }

  @Get(':id/perfil')
  @Ownership('patient')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Perfil completo del paciente' })
  @ApiResponse({ status: 200, description: 'Perfil del paciente' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  getPerfilCompleto(@Param('id', ParseIntPipe) id: number) {
    return this.pacienteService.getPerfilCompleto(id);
  }

  @Get(':id/alergias')
  @Ownership('patient')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Obtener alergias del paciente' })
  @ApiResponse({ status: 200, description: 'Lista de alergias' })
  @Roles('recepcionista', 'secretaria', 'medico', 'enfermeria')
  getAlergias(@Param('id', ParseIntPipe) id: number) {
    return this.pacienteService.getAlergias(id);
  }

  @Post(':id/alergias')
  @Ownership('patient')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Agregar alergia al paciente' })
  @ApiBody({ type: AddAlergiaDto })
  @ApiResponse({ status: 201, description: 'Alergia agregada' })
  @ApiResponse({ status: 404, description: 'Paciente o alergia no encontrado' })
  @ApiResponse({ status: 409, description: 'Alergia ya registrada' })
  addAlergia(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: AddAlergiaDto,
  ) {
    return this.pacienteService.addAlergia(id, dto);
  }

  @Post()
  @Roles('recepcionista', 'secretaria')
  @ApiOperation({ summary: 'Crear nuevo paciente' })
  @ApiResponse({ status: 201, description: 'Paciente creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'CI ya existe' })
  create(
    @Body(ValidationPipe) dto: CreatePacienteDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.pacienteService.create(dto, user.id);
  }

  @Put(':id')
  @Roles('recepcionista', 'secretaria')
  @Ownership('patient')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Actualizar paciente' })
  @ApiResponse({ status: 200, description: 'Paciente actualizado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdatePacienteDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.pacienteService.update(id, dto, user.id);
  }

  @Patch(':id/estado')
  @Roles('recepcionista', 'secretaria')
  @Ownership('patient')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Cambiar estado del paciente' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: string,
    @CurrentUser() user: { id: number },
  ) {
    return this.pacienteService.update(id, { estado }, user.id);
  }

  @Delete(':id')
  @Ownership('patient')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Eliminar paciente (soft delete)' })
  @ApiResponse({ status: 200, description: 'Paciente eliminado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.pacienteService.remove(id, user.id);
  }
}
