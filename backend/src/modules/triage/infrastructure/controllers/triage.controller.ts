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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TriageService } from '../../application/triage.service';
import {
  CreateTriageDto,
  UpdateTriageDto,
  TriageQueryDto,
} from '../dto/create-triage.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { AuditService } from '../../../../common/services/audit.service';
import { AuditAction } from '../../../../entities/audit-log.entity';

@ApiTags('Triage')
@ApiBearerAuth()
@Controller('triage')
@Roles('medico', 'enfermeria')
export class TriageController {
  constructor(
    private readonly triageService: TriageService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear registro de triage con cálculo ESI' })
  @ApiResponse({ status: 201, description: 'Triage creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(
    @Body(ValidationPipe) dto: CreateTriageDto,
    @CurrentUser() user: { id: number; email: string },
  ) {
    const triage = await this.triageService.create(dto, user.id);
    this.auditService
      .log({
        userId: String(user.id),
        userEmail: user.email,
        action: AuditAction.CREATE,
        entityType: 'triaje',
        entityId: String(triage.id),
        newValue: { pacienteId: dto.pacienteId, esiNivel: dto.esiNivel },
      })
      .catch(() => {});
    return triage;
  }

  @Get()
  @ApiOperation({ summary: 'Listar triages con filtros' })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'pacienteId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query(ValidationPipe) query: TriageQueryDto) {
    return this.triageService.findAll(query);
  }

  @Get('activos')
  @ApiOperation({ summary: 'Pacientes de emergencia activos' })
  findActivos() {
    return this.triageService.findActivos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener triage por ID' })
  @ApiResponse({ status: 200, description: 'Triage encontrado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.triageService.findOne(id);
  }

  @Get('paciente/:id')
  @ApiOperation({ summary: 'Historial de triages del paciente' })
  findByPaciente(@Param('id', ParseIntPipe) id: number) {
    return this.triageService.findByPaciente(id);
  }

  @Get('paciente/:id/ultimo')
  @ApiOperation({ summary: 'Último triage del paciente' })
  @ApiResponse({ status: 200, description: 'Último triage encontrado' })
  @ApiResponse({ status: 404, description: 'Sin triage registrado' })
  async findUltimoPaciente(@Param('id', ParseIntPipe) id: number) {
    const triages = await this.triageService.findByPaciente(id);
    if (!triages || triages.length === 0) {
      return {
        data: null,
        message: 'No hay triage registrado para este paciente',
      };
    }
    // El último es el primero ya que findByPaciente ordena por fechaHora DESC
    return triages[0];
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar triage' })
  @ApiResponse({ status: 200, description: 'Triage actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateTriageDto,
  ) {
    return this.triageService.update(id, dto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado del triage' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 400, description: 'Transición inválida' })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: string,
  ) {
    return this.triageService.cambiarEstado(id, estado);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar triage (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.triageService.remove(id);
  }
}
