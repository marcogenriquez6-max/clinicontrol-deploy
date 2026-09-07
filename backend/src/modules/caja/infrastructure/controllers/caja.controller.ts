import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CajaService } from '../../application/caja.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
  AbrirSesionDto,
  CerrarSesionDto,
  CobrarDto,
} from '../dto/create-caja-session.dto';

@ApiTags('Caja')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Get()
  @Roles('admin', 'gerente', 'recepcionista', 'secretaria')
  @ApiOperation({ summary: 'Listar sesiones de caja' })
  findAll() {
    return this.cajaService.findAll();
  }

  @Get('actual')
  @Roles('admin', 'gerente', 'recepcionista', 'secretaria')
  @ApiOperation({ summary: 'Obtener sesión de caja actual' })
  async getSesionActual() {
    return this.cajaService.getSesionActual();
  }

  @Get(':id')
  @Roles('admin', 'gerente', 'recepcionista', 'secretaria')
  @ApiOperation({ summary: 'Obtener sesión de caja por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cajaService.findOne(id);
  }

  @Post('abrir')
  @Roles('admin', 'recepcionista', 'secretaria')
  @ApiOperation({ summary: 'Abrir sesión de caja' })
  abrirSesion(@Body(ValidationPipe) dto: AbrirSesionDto) {
    return this.cajaService.abrirSesion(dto.montoInicial, dto.usuarioId);
  }

  @Put(':id/cerrar')
  @Roles('admin', 'recepcionista', 'secretaria')
  @ApiOperation({ summary: 'Cerrar sesión de caja' })
  cerrarSesion(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: CerrarSesionDto,
  ) {
    return this.cajaService.cerrarSesion(id, dto.montoFinal, dto.observaciones);
  }

  @Post('cobrar')
  @Roles('admin', 'recepcionista', 'secretaria')
  @ApiOperation({ summary: 'Registrar cobro de turno' })
  cobrar(@Body(ValidationPipe) dto: CobrarDto) {
    return this.cajaService.cobrar(dto.montoRecibido);
  }

  @Get('pendientes')
  @Roles('recepcionista', 'secretaria')
  @ApiOperation({ summary: 'Listar turnos pendientes de cobro (hoy)' })
  async getTurnosPendientes() {
    return this.cajaService.getTurnosPendientes();
  }

  @Get('arqueo/hoy')
  @Roles('admin', 'gerente', 'recepcionista', 'secretaria')
  @ApiOperation({ summary: 'Arqueo de caja (hoy)' })
  async getArqueoHoy() {
    return this.cajaService.getArqueoHoy();
  }

  @Post('arqueo/cierre')
  @Roles('admin', 'recepcionista', 'secretaria')
  @ApiOperation({ summary: 'Cerrar caja y contabilizar' })
  async cerrarCaja() {
    return this.cajaService.cerrarCaja();
  }
}
