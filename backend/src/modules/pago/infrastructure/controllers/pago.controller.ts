import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { PagoService } from '../../application/pago.service';
import {
  AnularPagoDto,
  PagoQueryDto,
  RegistrarPagoDto,
} from '../dto/pago.dto';

const RECEPCION = ['recepcionista', 'secretaria'] as const;
const LECTURA = ['recepcionista', 'secretaria', 'gerente'] as const;

@ApiTags('Pagos y Recibos')
@ApiBearerAuth()
@Controller('pagos')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @Get()
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar pagos registrados (recibos)' })
  findAll(@Query(ValidationPipe) query: PagoQueryDto) {
    return this.pagoService.findAll(query);
  }

  @Get('pendientes')
  @Roles(...RECEPCION)
  @ApiOperation({ summary: 'Turnos del día sin pago registrado' })
  @ApiQuery({ name: 'fecha', required: false, example: '2026-09-05' })
  pendientes(@Query('fecha') fecha?: string) {
    return this.pagoService.pendientes(fecha || undefined);
  }

  @Get('resumen')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Cantidad y total de pagos en un período' })
  resumen(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.pagoService.resumen(
      fechaInicio || undefined,
      fechaFin || undefined,
    );
  }

  @Get(':id')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Obtener un pago' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagoService.findOne(id);
  }

  @Get(':id/recibo')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Datos del recibo para impresión' })
  recibo(@Param('id', ParseIntPipe) id: number) {
    return this.pagoService.recibo(id);
  }

  @Post()
  @Roles(...RECEPCION)
  @ApiOperation({ summary: 'Registrar pago en efectivo de una atención' })
  @ApiResponse({ status: 201, description: 'Pago registrado, recibo emitido' })
  @ApiResponse({ status: 409, description: 'El turno ya estaba pagado' })
  registrar(
    @Body(ValidationPipe) dto: RegistrarPagoDto,
    @CurrentUser() user: { id: number; email: string },
  ) {
    return this.pagoService.registrar(dto, user);
  }

  @Patch(':id/anular')
  @Roles(...RECEPCION)
  @ApiOperation({ summary: 'Anular un recibo (queda registrado en auditoría)' })
  anular(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: AnularPagoDto,
    @CurrentUser() user: { id: number; email: string },
  ) {
    return this.pagoService.anular(id, dto, user);
  }
}
