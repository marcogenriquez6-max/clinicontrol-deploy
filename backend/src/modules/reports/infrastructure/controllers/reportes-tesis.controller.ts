import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ReportesTesisService } from '../../application/reportes-tesis.service';

type Usuario = { id: number; rol: string; email: string };

@ApiTags('Reportes por rol')
@ApiBearerAuth()
@Controller('reports')
export class ReportesTesisController {
  constructor(private readonly svc: ReportesTesisService) {}

  @Get('recepcion')
  @Roles('recepcionista', 'secretaria', 'gerente')
  @ApiOperation({ summary: 'Reporte de recepción: pacientes, citas, turnos y pagos' })
  @ApiQuery({ name: 'fechaInicio', required: false })
  @ApiQuery({ name: 'fechaFin', required: false })
  recepcion(@Query('fechaInicio') fechaInicio?: string, @Query('fechaFin') fechaFin?: string) {
    return this.svc.recepcion({ fechaInicio, fechaFin });
  }

  @Get('triaje')
  @Roles('enfermeria', 'medico', 'gerente')
  @ApiOperation({ summary: 'Reporte de triaje: realizados, clasificación ESI, atendidos' })
  triaje(@Query('fechaInicio') fechaInicio?: string, @Query('fechaFin') fechaFin?: string) {
    return this.svc.triaje({ fechaInicio, fechaFin });
  }

  @Get('medico')
  @Roles('medico', 'gerente')
  @ApiOperation({ summary: 'Reporte médico: consultas, diagnósticos frecuentes, recetas' })
  async medico(
    @CurrentUser() user: Usuario,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('medicoId') medicoId?: string,
  ) {
    let id = medicoId ? Number(medicoId) : undefined;
    if (user.rol === 'medico') {
      // El médico solo puede ver su propia producción.
      id = await this.svc.medicoIdDeUsuario(user.id);
      if (!id) throw new ForbiddenException('Su usuario no está vinculado a un médico');
    }
    return this.svc.medico({ fechaInicio, fechaFin }, id);
  }

  @Get('hospitalizacion')
  @Roles('medico', 'enfermeria', 'gerente')
  @ApiOperation({ summary: 'Reporte de hospitalización: internados, camas ocupadas, altas' })
  hospitalizacion(@Query('fechaInicio') fechaInicio?: string, @Query('fechaFin') fechaFin?: string) {
    return this.svc.hospitalizacion({ fechaInicio, fechaFin });
  }

  @Get('indicadores')
  @Roles('gerente', 'admin', 'recepcionista', 'secretaria')
  @ApiOperation({ summary: 'Indicadores del día para gerencia' })
  indicadores() {
    return this.svc.indicadores();
  }

  @Get('estadisticas-periodo')
  @Roles('gerente')
  @ApiOperation({ summary: 'Estadísticas del período (series y distribuciones)' })
  estadisticas(@Query('fechaInicio') fechaInicio?: string, @Query('fechaFin') fechaFin?: string) {
    return this.svc.estadisticas({ fechaInicio, fechaFin });
  }

  @Get('pacientes')
  @Roles('gerente')
  @ApiOperation({ summary: 'Reporte de pacientes: registrados, nuevos, activos' })
  pacientes(@Query('fechaInicio') fechaInicio?: string, @Query('fechaFin') fechaFin?: string) {
    return this.svc.pacientes({ fechaInicio, fechaFin });
  }

  @Get('citas/resumen')
  @Roles('gerente', 'recepcionista', 'secretaria')
  @ApiOperation({ summary: 'Reporte de citas: programadas, atendidas, canceladas' })
  citas(@Query('fechaInicio') fechaInicio?: string, @Query('fechaFin') fechaFin?: string) {
    return this.svc.citas({ fechaInicio, fechaFin });
  }

  @Get('productividad')
  @Roles('gerente')
  @ApiOperation({ summary: 'Reporte médico gerencial: consultas por médico y productividad' })
  productividad(@Query('fechaInicio') fechaInicio?: string, @Query('fechaFin') fechaFin?: string) {
    return this.svc.productividad({ fechaInicio, fechaFin });
  }

  @Get('auditoria')
  @Roles('admin', 'gerente')
  @ApiOperation({ summary: 'Reporte de auditoría: general, por usuario o accesos' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['general', 'usuario', 'accesos'] })
  auditoria(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('tipo') tipo?: string,
    @Query('userId') userId?: string,
  ) {
    const t = (['general', 'usuario', 'accesos'].includes(tipo ?? '') ? tipo : 'general') as
      | 'general'
      | 'usuario'
      | 'accesos';
    return this.svc.auditoria({ fechaInicio, fechaFin }, t, userId || undefined);
  }

  @Post('impresion')
  @Roles('admin', 'gerente', 'secretaria', 'medico', 'recepcionista', 'enfermeria')
  @ApiOperation({ summary: 'Registrar en auditoría la impresión de un reporte o documento' })
  impresion(
    @CurrentUser() user: Usuario,
    @Body() body: { reporte?: string; detalle?: string },
  ) {
    const reporte = (body?.reporte ?? 'reporte').toString().slice(0, 100);
    const detalle = body?.detalle ? String(body.detalle).slice(0, 300) : undefined;
    return this.svc.registrarImpresion(user, reporte, detalle);
  }
}
