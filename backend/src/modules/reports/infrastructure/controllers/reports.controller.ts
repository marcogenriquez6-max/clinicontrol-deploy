import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Res,
  Header,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from '../../application/reports.service';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Reportes')
@ApiBearerAuth()
@Controller('reports')
@Roles('gerente', 'medico')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('historia-clinica/:pacienteId')
  @ApiOperation({ summary: 'Historia clinica completa en PDF' })
  @ApiResponse({ status: 200, description: 'PDF de historia clinica' })
  @Header('Content-Type', 'application/pdf')
  async getHistoriaClinica(
    @Param('pacienteId', ParseIntPipe) pacienteId: number,
    @Res() res: Response,
  ): Promise<void> {
    const pdf =
      await this.reportsService.generateHistoriaClinicaPdf(pacienteId);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="historia-clinica-${pacienteId}.pdf"`,
    );
    res.end(pdf);
  }

  @Get('citas')
  @ApiOperation({ summary: 'Reporte de citas en PDF' })
  @ApiQuery({ name: 'fechaInicio', required: false })
  @ApiQuery({ name: 'fechaFin', required: false })
  @ApiQuery({ name: 'medicoId', required: false, type: Number })
  @ApiQuery({ name: 'estadoId', required: false, type: Number })
  @Header('Content-Type', 'application/pdf')
  async getReporteCitas(
    @Query('fechaInicio') fechaInicio = '',
    @Query('fechaFin') fechaFin = '',
    @Query('medicoId') medicoId = '',
    @Query('estadoId') estadoId = '',
    @Res() res: Response,
  ): Promise<void> {
    const pdf = await this.reportsService.generateReporteCitas(
      fechaInicio || undefined,
      fechaFin || undefined,
      medicoId ? Number(medicoId) : undefined,
      estadoId ? Number(estadoId) : undefined,
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte-citas.pdf"`,
    );
    res.end(pdf);
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Estadisticas del sistema' })
  @ApiResponse({ status: 200 })
  async getEstadisticas(): Promise<Record<string, unknown>> {
    return this.reportsService.generateEstadisticas();
  }

  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'))
  // El dashboard es la pantalla de inicio de todos los roles → KPIs accesibles a todo el personal.
  @Roles(
    'admin',
    'gerente',
    'secretaria',
    'medico',
    'recepcionista',
    'enfermeria',
  )
  @ApiOperation({ summary: 'Dashboard KPIs' })
  @ApiResponse({ status: 200, description: 'KPIs del dashboard' })
  async getDashboard(): Promise<Record<string, unknown>> {
    return this.reportsService.getDashboard();
  }

  @Get('pacientes/excel')
  @ApiOperation({ summary: 'Exportar pacientes a Excel' })
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async getExcelPacientes(@Res() res: Response): Promise<void> {
    const excel = await this.reportsService.generateExcelPacientes();
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="pacientes.xlsx"`,
    );
    res.end(excel);
  }

  @Get('triaje-esi')
  @ApiOperation({ summary: 'Reporte de triaje ESI por nivel de urgencia' })
  @ApiQuery({ name: 'fechaInicio', required: false })
  @ApiQuery({ name: 'fechaFin', required: false })
  @ApiQuery({ name: 'enfermeraId', required: false, type: Number })
  @ApiQuery({ name: 'personalId', required: false, type: Number })
  @Header('Content-Type', 'application/json')
  async getTriajeESI(
    @Query('fechaInicio') fechaInicio = '',
    @Query('fechaFin') fechaFin = '',
    @Query('enfermeraId') enfermeraId = '',
    @Query('personalId') personalId = '',
    @Res() res: Response,
  ): Promise<void> {
    const reporte = await this.reportsService.getTriajeESI(
      fechaInicio || undefined,
      fechaFin || undefined,
      enfermeraId ? Number(enfermeraId) : (personalId ? Number(personalId) : undefined),
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="triaje-esi-${Date.now()}.json"`,
    );
    res.json(reporte);
  }
}
