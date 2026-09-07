import {
  BadRequestException,
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
} from '@nestjs/swagger';
import { CitaService } from '../../application/cita.service';
import {
  CreateCitaDto,
  UpdateCitaDto,
  CitaQueryDto,
} from '../dto/create-cita.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Ownership } from '../../../../common/decorators/ownership.decorator';
import { OwnershipGuard } from '../../../../common/guards/ownership.guard';
import { AuditService } from '../../../../common/services/audit.service';
import { AuditAction } from '../../../../entities/audit-log.entity';

@ApiTags('Citas')
@ApiBearerAuth()
@Controller('citas')
export class CitaController {
  constructor(
    private readonly citaService: CitaService,
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
        entityType: 'cita',
        entityId: String(entityId),
        newValue: detalle,
      })
      .catch(() => {});
  }

  @Get()
  @ApiOperation({ summary: 'Listar citas con filtros' })
  @ApiQuery({ name: 'pacienteId', required: false })
  @ApiQuery({ name: 'medicoId', required: false })
  @ApiQuery({ name: 'fecha', required: false })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de citas' })
  @Roles('recepcionista', 'secretaria', 'medico')
  findAll(@Query() query: CitaQueryDto) {
    return this.citaService.findAll(query);
  }

  @Get('medico/:medicoId/disponibilidad')
  @ApiOperation({ summary: 'Ver disponibilidad de medico por fecha' })
  getDisponibilidad(
    @Param('medicoId', ParseIntPipe) medicoId: number,
    @Query('fecha') fecha: string,
  ) {
    return this.citaService.getDisponibilidad(medicoId, new Date(fecha));
  }

  @Get('medico/:medicoId/slots')
  @ApiOperation({ summary: 'Ver slots disponibles por medico, fecha y servicio' })
  getSlots(
    @Param('medicoId', ParseIntPipe) medicoId: number,
    @Query('fecha') fecha: string,
    @Query('servicioId', new ParseIntPipe({ optional: true })) servicioId?: number,
  ) {
    return this.citaService.getSlots(medicoId, fecha, servicioId);
  }

  @Get(':id')
  @Ownership('appointment')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Obtener cita por ID' })
  @ApiResponse({ status: 200, description: 'Cita encontrada' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  @Roles('recepcionista', 'secretaria', 'medico', 'enfermeria')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.citaService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva cita' })
  @ApiResponse({ status: 201, description: 'Cita creada' })
  @ApiResponse({ status: 409, description: 'Horario no disponible' })
  async create(
    @Body(ValidationPipe) dto: CreateCitaDto,
    @CurrentUser() user: { id: number; email: string },
  ) {
    const cita = await this.citaService.create(dto, user.id);
    this.auditar(user, AuditAction.CREATE, cita.id, {
      pacienteId: dto.pacienteId,
      medicoId: dto.medicoId,
      fecha: dto.fecha,
    });
    return cita;
  }

  @Put(':id')
  @Ownership('appointment')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Actualizar cita' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateCitaDto,
  ) {
    return this.citaService.update(id, dto);
  }

  @Patch(':id/cancelar')
  @Ownership('appointment')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Cancelar cita' })
  async cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
    @CurrentUser() user: { id: number; email: string },
  ) {
    if (!motivo || !motivo.trim()) {
      throw new BadRequestException('El motivo de cancelación es obligatorio');
    }
    const cita = await this.citaService.cancelar(id, motivo, user.id);
    this.auditar(user, AuditAction.UPDATE, id, { cancelada: true, motivo });
    return cita;
  }

  @Post(':id/llegada')
  @Ownership('appointment')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Registrar llegada a cita' })
  @ApiResponse({
    status: 201,
    description: 'Llegada registrada y turno emitido',
  })
  @ApiResponse({
    status: 409,
    description: 'La cita ya tiene turno o no puede ser atendida',
  })
  async llegada(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.citaService.llegada(id, user.id);
  }

  @Patch(':id/reprogramar')
  @Ownership('appointment')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Reprogramar cita' })
  async reprogramar(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    dto: { fecha: Date; horaInicio: string; servicioId?: number },
    @CurrentUser() user: { id: number; email: string },
  ) {
    const cita = await this.citaService.reprogramar(id, dto);
    this.auditar(user, AuditAction.UPDATE, id, {
      reprogramada: true,
      fecha: dto.fecha,
      horaInicio: dto.horaInicio,
    });
    return cita;
  }

  @Delete(':id')
  @Ownership('appointment')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Eliminar cita' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.citaService.remove(id);
  }
}
