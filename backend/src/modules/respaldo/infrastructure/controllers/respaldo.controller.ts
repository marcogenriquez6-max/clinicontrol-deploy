import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RespaldoService } from '../../application/respaldo.service';

@ApiTags('Respaldos')
@ApiBearerAuth()
@Controller('respaldos')
@Roles('admin')
export class RespaldoController {
  constructor(private readonly respaldoService: RespaldoService) {}

  @Get()
  @ApiOperation({ summary: 'Listar respaldos disponibles' })
  listar() {
    return this.respaldoService.listar();
  }

  @Post()
  @ApiOperation({ summary: 'Generar un respaldo de la base de datos (pg_dump)' })
  crear(@CurrentUser() user: { id: number; email: string }) {
    return this.respaldoService.crear(user);
  }

  @Get(':nombre/descargar')
  @ApiOperation({ summary: 'Descargar un respaldo' })
  async descargar(@Param('nombre') nombre: string, @Res() res: Response) {
    const stream = await this.respaldoService.stream(nombre);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
    stream.pipe(res);
  }

  @Delete(':nombre')
  @ApiOperation({ summary: 'Eliminar un respaldo' })
  eliminar(
    @Param('nombre') nombre: string,
    @CurrentUser() user: { id: number; email: string },
  ) {
    return this.respaldoService.eliminar(nombre, user);
  }
}
