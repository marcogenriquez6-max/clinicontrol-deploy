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
import { HospitalizacionService } from '../../application/hospitalizacion.service';
import {
  CreateHospitalizacionDto,
  UpdateHospitalizacionDto,
  DarAltaDto,
  CreateCamaDto,
  UpdateCamaDto,
  CreateNotaEvolucionHospitalizacionDto,
  HospitalizacionQueryDto,
} from '../dto/create-hospitalizacion.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { AuditService } from '../../../../common/services/audit.service';
import { AuditAction } from '../../../../entities/audit-log.entity';

@ApiTags('Hospitalización')
@ApiBearerAuth()
@Controller('hospitalizacion')
@Roles('medico', 'enfermeria')
export class HospitalizacionController {
  constructor(
    private readonly hospService: HospitalizacionService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Admitir paciente (hospitalización)' })
  @ApiResponse({ status: 201, description: 'Hospitalización creada' })
  async create(
    @Body(ValidationPipe) dto: CreateHospitalizacionDto,
    @CurrentUser() user: { id: number; email: string },
  ) {
    const hosp = await this.hospService.create(dto, user.id);
    this.auditService
      .log({
        userId: String(user.id),
        userEmail: user.email,
        action: AuditAction.CREATE,
        entityType: 'hospitalizacion',
        entityId: String(hosp.id),
        newValue: { pacienteId: dto.pacienteId, camaId: dto.camaId },
      })
      .catch(() => {});
    return hosp;
  }

  @Get()
  @ApiOperation({ summary: 'Listar hospitalizaciones' })
  findAll(@Query(ValidationPipe) query: HospitalizacionQueryDto) {
    return this.hospService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas de ocupación' })
  getStats() {
    return this.hospService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener hospitalización por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hospService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar hospitalización' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateHospitalizacionDto,
  ) {
    return this.hospService.update(id, dto);
  }

  @Post(':id/alta')
  @ApiOperation({ summary: 'Dar de alta al paciente' })
  async darAlta(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: DarAltaDto,
    @CurrentUser() user: { id: number; email: string },
  ) {
    const hosp = await this.hospService.darAlta(id, dto);
    this.auditService
      .log({
        userId: String(user.id),
        userEmail: user.email,
        action: AuditAction.UPDATE,
        entityType: 'hospitalizacion',
        entityId: String(id),
        newValue: { alta: true, diagnosticoAlta: dto.diagnosticoAlta },
      })
      .catch(() => {});
    return hosp;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar hospitalización' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hospService.remove(id);
  }

  @Post(':id/notas')
  @ApiOperation({ summary: 'Agregar nota de evolución' })
  async createNota(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: CreateNotaEvolucionHospitalizacionDto,
    @CurrentUser() user: { id: number; email: string },
  ) {
    const nota = await this.hospService.createNotaEvolucion(id, dto, user.id);
    this.auditService
      .log({
        userId: String(user.id),
        userEmail: user.email,
        action: AuditAction.CREATE,
        entityType: 'evolucion',
        entityId: String(id),
      })
      .catch(() => {});
    return nota;
  }

  @Get(':id/notas')
  @ApiOperation({ summary: 'Obtener notas de evolución' })
  findNotas(@Param('id', ParseIntPipe) id: number) {
    return this.hospService.findNotasEvolucion(id);
  }
}

@ApiTags('Camas')
@ApiBearerAuth()
@Controller('camas')
@Roles('admin', 'medico', 'enfermeria', 'recepcionista', 'secretaria')
export class CamaController {
  constructor(private readonly hospService: HospitalizacionService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear nueva cama' })
  create(@Body(ValidationPipe) dto: CreateCamaDto) {
    return this.hospService.createCama(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar camas' })
  @ApiQuery({ name: 'servicio', required: false })
  findAll(@Query('servicio') servicio?: string) {
    return this.hospService.findAllCamas(servicio);
  }

  @Get('disponibles')
  @ApiOperation({ summary: 'Camas disponibles' })
  @ApiQuery({ name: 'servicio', required: false })
  getDisponibles(@Query('servicio') servicio?: string) {
    return this.hospService.getCamasDisponibles(servicio);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cama por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hospService.findCama(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar cama' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateCamaDto,
  ) {
    return this.hospService.updateCama(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar cama' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hospService.removeCama(id);
  }
}
