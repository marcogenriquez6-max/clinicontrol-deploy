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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SucursalService } from '../../application/sucursal.service';
import {
  CreateSucursalDto,
  UpdateSucursalDto,
} from '../dto/create-sucursal.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Sucursales')
@ApiBearerAuth()
@Controller('sucursales')
@Roles('admin')
export class SucursalController {
  constructor(private readonly service: SucursalService) {}

  @Get()
  @ApiOperation({ summary: 'Listar sucursales activas' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sucursal por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear sucursal' })
  create(@Body() dto: CreateSucursalDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar sucursal' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSucursalDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar sucursal' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
