import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  ValidationPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RecetaService } from '../../application/receta.service';
import { RecetaPdfService } from '../receta-pdf.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  CreateRecetaDto,
  UpdateRecetaDto,
  AddMedicamentoDto,
  DispensarRecetaDto,
} from '../dto/create-receta.dto';
import { VerificarDuplicidadDto } from '../dto/verificar-duplicidad.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Ownership } from '../../../../common/decorators/ownership.decorator';
import { OwnershipGuard } from '../../../../common/guards/ownership.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { Response } from 'express';
import { AuditService } from '../../../../common/services/audit.service';
import { AuditAction } from '../../../../entities/audit-log.entity';

@ApiTags('Recetas')
@ApiBearerAuth()
@Controller('recetas')
@Roles('medico')
export class RecetaController {
  constructor(
    private readonly recetaService: RecetaService,
    private readonly recetaPdfService: RecetaPdfService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las recetas' })
  findAll(@Query('estado') estado?: string) {
    return this.recetaService.findAll(estado);
  }

  @Get('medicamentos')
  @ApiOperation({ summary: 'Buscar medicamentos' })
  findMedicamentos(@Query('q') query?: string) {
    return this.recetaService.findMedicamentos(query);
  }

  @Get(':id')
  @Ownership('consultation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Obtener receta por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recetaService.findOne(id);
  }

  @Get(':id/pdf')
  @Ownership('consultation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Exportar receta a PDF' })
  async generatePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.recetaPdfService.generateRecetaPdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="receta-${id}.pdf"`,
    );
    res.send(pdfBuffer);
  }

  @Get('consulta/:consultaId')
  @Ownership('consultation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Obtener recetas por consulta' })
  findByConsulta(@Param('consultaId', ParseIntPipe) consultaId: number) {
    return this.recetaService.findByConsulta(consultaId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva receta con medicamentos' })
  async create(
    @Body(ValidationPipe) dto: CreateRecetaDto,
    @CurrentUser() user: { id: number; email: string },
  ) {
    const receta = await this.recetaService.create(dto);
    this.auditService
      .log({
        userId: String(user.id),
        userEmail: user.email,
        action: AuditAction.CREATE,
        entityType: 'receta',
        entityId: String(receta.id),
        newValue: { consultaId: dto.consultaId },
      })
      .catch(() => {});
    return receta;
  }

  @Put(':id')
  @Ownership('consultation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Actualizar receta' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateRecetaDto,
  ) {
    return this.recetaService.update(id, dto);
  }

  @Delete(':id')
  @Ownership('consultation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Eliminar receta' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.recetaService.delete(id);
  }

  @Post(':id/dispensar')
  @Roles('medico', 'enfermeria')
  @Ownership('consultation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Dispensar medicamentos de receta' })
  dispensar(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: DispensarRecetaDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.recetaService.dispensar(id, dto, user.id);
  }

  @Post(':id/medicamentos')
  @Ownership('consultation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Agregar medicamento a receta' })
  addMedicamento(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: AddMedicamentoDto,
  ) {
    return this.recetaService.addMedicamento(id, dto);
  }

  @Delete('medicamentos/:id')
  @Ownership('consultation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Eliminar medicamento de receta' })
  removeMedicamento(@Param('id', ParseIntPipe) id: number) {
    return this.recetaService.removeMedicamento(id);
  }

  @Post('verificar-duplicidad')
  @ApiOperation({ summary: 'Verificar seguridad farmacologica (duplicidad)' })
  async verificarDuplicidad(@Body(ValidationPipe) dto: VerificarDuplicidadDto) {
    return this.recetaService.verificarSeguridad(
      dto.pacienteId,
      dto.medicamentoIds,
    );
  }

  @Post('verificar-seguridad-al-completa')
  @ApiOperation({ summary: 'Verificar seguridad farmacológica completa' })
  async verificarSeguridadAlCompleta(
    @Body(ValidationPipe) dto: VerificarDuplicidadDto,
  ) {
    return this.recetaService.verificarSeguridadCompleta(
      dto.pacienteId,
      dto.medicamentoIds,
    );
  }
}
