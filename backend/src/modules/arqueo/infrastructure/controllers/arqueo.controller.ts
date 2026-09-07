import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ArqueoService } from '../../application/arqueo.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Arqueo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('arqueo')
export class ArqueoController {
  constructor(private readonly arqueoService: ArqueoService) {}

  @Get()
  @Roles('admin', 'gerente')
  @ApiOperation({ summary: 'Listar arqueos de caja (solo lectura para informes)' })
  findAll() {
    return this.arqueoService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'gerente')
  @ApiOperation({ summary: 'Obtener arqueo por ID (solo lectura para informes)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.arqueoService.findOne(id);
  }
}
