import {
  Controller,
  Get,
  Post,
  Put,
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
} from '@nestjs/swagger';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { AuditService } from '../../../../common/services/audit.service';
import { AuditAction } from '../../../../entities/audit-log.entity';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Ownership } from '../../../../common/decorators/ownership.decorator';
import { OwnershipGuard } from '../../../../common/guards/ownership.guard';
import { ConsultaService } from '../../application/consulta.service';
import {
  CreateConsultaDto,
  UpdateConsultaDto,
} from '../dto/create-consulta.dto';
import { CreateConsultaCompletaDto } from '../dto/create-consulta-completa.dto';
import { ContinuarConsultaDto } from '../dto/continuar-consulta.dto';
import { CreateNotaEvolucionDto } from '../dto/create-nota-evolucion.dto';

@ApiTags('Consultas Médicas')
@ApiBearerAuth()
@Controller('consultas')
@Roles('medico', 'enfermeria')
export class ConsultaController {
  constructor(
    private readonly consultaService: ConsultaService,
    private readonly auditService: AuditService,
  ) {}

  private auditar(
    user: { id: number; email?: string },
    action: AuditAction,
    entityId: string | number,
    detalle?: Record<string, unknown>,
  ) {
    this.auditService
      .log({
        userId: String(user.id),
        userEmail: user.email,
        action,
        entityType: 'consulta',
        entityId: String(entityId),
        newValue: detalle,
      })
      .catch(() => {});
  }

  @Get()
  @ApiOperation({ summary: 'Listar consultas con filtros' })
  @ApiQuery({ name: 'pacienteId', required: false })
  @ApiQuery({ name: 'medicoId', required: false })
  @ApiQuery({ name: 'fecha', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('pacienteId') pacienteId?: string,
    @Query('medicoId') medicoId?: string,
    @Query('fecha') fecha?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.consultaService.findAll({
      pacienteId: pacienteId ? Number(pacienteId) : undefined,
      medicoId: medicoId ? Number(medicoId) : undefined,
      fecha: fecha ? new Date(fecha) : undefined,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('paciente/:pacienteId/timeline')
  @Ownership('patient')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Timeline clínico completo del paciente' })
  getTimeline(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.consultaService.getPacienteTimeline(pacienteId);
  }

  @Get('paciente/:pacienteId/historial')
  @Ownership('patient')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Historial clínico completo del paciente' })
  getHistorial(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.consultaService.getHistorialCompleto(pacienteId);
  }

  @Get(':id')
  @Roles('medico', 'enfermeria')
  @Ownership('consultation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Obtener consulta por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.consultaService.findOne(id);
  }

  @Post()
  @Roles('medico')
  @ApiOperation({ summary: 'Crear nueva consulta médica' })
  @ApiResponse({ status: 201, description: 'Consulta creada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(
    @Body(ValidationPipe) dto: CreateConsultaDto,
    @CurrentUser() user: { id: number; email: string },
  ) {
    const consulta = await this.consultaService.create(dto, user.id);
    this.auditar(user, AuditAction.CREATE, consulta.id, {
      pacienteId: dto.pacienteId,
    });
    return consulta;
  }

  @Put(':id')
  @Roles('medico')
  @Ownership('consultation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({
    summary: 'Actualizar consulta (inmutabilidad: solo autor dentro de 24h)',
  })
  @ApiResponse({ status: 200, description: 'Consulta actualizada' })
  @ApiResponse({ status: 409, description: 'Ventana de enmienda vencida' })
  @ApiResponse({ status: 403, description: 'Médico distinto del autor' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateConsultaDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.consultaService.update(id, dto, user.id);
  }

  @Post('completa')
  @Roles('medico')
  @ApiOperation({
    summary: 'Crear consulta completa con diagnósticos SOAP y recetas',
  })
  @ApiResponse({ status: 201, description: 'Consulta completa creada' })
  @ApiResponse({ status: 400, description: 'Error de validación clínica' })
  async createCompleta(
    @Body(ValidationPipe) dto: CreateConsultaCompletaDto,
    @CurrentUser() user: { id: number; email: string },
  ) {
    const medicoId = await this.consultaService.medicoIdDeUsuario(user.id);
    const consulta = await this.consultaService.createConsultaCompleta({
      pacienteId: dto.pacienteId,
      medicoId,
      citaId: dto.citaId,
      motivoConsulta: dto.motivoConsulta,
      sintomas: dto.sintomas,
      enfermedadActual: dto.enfermedadActual,
      examenFisico: dto.examenFisico,
      peso: dto.peso,
      talla: dto.talla,
      temperatura: dto.temperatura,
      frecuenciaCardiaca: dto.frecuenciaCardiaca,
      frecuenciaRespiratoria: dto.frecuenciaRespiratoria,
      presionArterialSistolica: dto.presionArterialSistolica,
      presionArterialDiastolica: dto.presionArterialDiastolica,
      saturacionOxigeno: dto.saturacionOxigeno,
      glucosaCapilar: dto.glucosaCapilar,
      evaluacion: dto.evaluacion,
      planTratamiento: dto.planTratamiento,
      indicaciones: dto.indicaciones,
      diagnosticos: dto.diagnosticos.map((d) => ({
        cie10Id: d.cie10Id,
        descripcion: d.descripcion,
        tipo: d.tipo,
        esCronico: d.esCronico ?? false,
      })),
      recetas: dto.recetas?.map((r) => ({
        medicamentoId: r.medicamentoId,
        dosis: r.dosis,
        frecuencia: r.frecuencia,
        duracion: r.duracion,
        cantidad: r.cantidad,
        observaciones: r.observaciones,
      })),
      esContinuacion: dto.esContinuacion,
      consultaOriginalId: dto.consultaOriginalId,
      motivoContinuacion: dto.motivoContinuacion,
    });
    this.auditar(user, AuditAction.CREATE, (consulta as { id?: number })?.id ?? 'nueva', {
      pacienteId: dto.pacienteId,
      diagnosticos: dto.diagnosticos?.length ?? 0,
      recetas: dto.recetas?.length ?? 0,
      soap: true,
    });
    return consulta;
  }

  @Post(':id/continuar')
  @Ownership('consultation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Continuar consulta (continuidad de cuidado)' })
  @ApiResponse({ status: 201, description: 'Consulta continuada creada' })
  continuar(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: ContinuarConsultaDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.consultaService.medicoIdDeUsuario(user.id).then((medicoId) =>
      this.consultaService.continuarConsulta(id, medicoId, {
        motivoConsulta: dto.motivoConsulta,
        sintomas: dto.sintomas,
        enfermedadActual: dto.enfermedadActual,
        examenFisico: dto.examenFisico,
        evaluacion: dto.evaluacion,
        planTratamiento: dto.planTratamiento,
        indicaciones: dto.indicaciones,
        peso: dto.peso,
        talla: dto.talla,
        temperatura: dto.temperatura,
        frecuenciaCardiaca: dto.frecuenciaCardiaca,
        frecuenciaRespiratoria: dto.frecuenciaRespiratoria,
        presionArterialSistolica: dto.presionArterialSistolica,
        presionArterialDiastolica: dto.presionArterialDiastolica,
        saturacionOxigeno: dto.saturacionOxigeno,
        glucosaCapilar: dto.glucosaCapilar,
        diagnosticos: dto.diagnosticos.map((d) => ({
          cie10Id: d.cie10Id,
          descripcion: d.descripcion,
          tipo: d.tipo,
          esCronico: d.esCronico ?? false,
        })),
        recetas: dto.recetas?.map((r) => ({
          medicamentoId: r.medicamentoId,
          dosis: r.dosis,
          frecuencia: r.frecuencia,
          duracion: r.duracion,
          cantidad: r.cantidad,
          observaciones: r.observaciones,
        })),
        motivoContinuacion: dto.motivoContinuacion,
      }),
    );
  }

  @Post(':id/nota')
  @Roles('medico')
  @Ownership('consultation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({
    summary:
      'Registrar nota de evolución / enmienda sobre una consulta (Ley 3131, R.M. 0090)',
  })
  @ApiResponse({ status: 201, description: 'Nota registrada' })
  @ApiResponse({ status: 404, description: 'Consulta no existe' })
  @ApiResponse({ status: 400, description: 'Contenido vacío' })
  async registrarNota(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: CreateNotaEvolucionDto,
    @CurrentUser() user: { id: number },
  ) {
    const nota = await this.consultaService.agregarNota(
      id,
      user.id,
      dto.contenido,
      dto.tipo,
    );
    return nota;
  }
}
