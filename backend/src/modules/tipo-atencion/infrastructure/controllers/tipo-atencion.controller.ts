import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TipoAtencionService } from '../../application/tipo-atencion.service';
import {
  CreateTipoAtencionDto,
  UpdateTipoAtencionDto,
} from '../dto/create-tipo-atencion.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Tipos de Atención')
@ApiBearerAuth()
@Controller('tipos-atencion')
export class TipoAtencionController {
  constructor(private readonly service: TipoAtencionService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de atención' })
  @Roles('admin', 'recepcionista', 'secretaria', 'medico')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo de atención por ID' })
  @Roles('admin', 'recepcionista', 'secretaria', 'medico')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear tipo de atención' })
  @Roles('admin')
  create(@Body(ValidationPipe) dto: CreateTipoAtencionDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar tipo de atención' })
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateTipoAtencionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar tipo de atención' })
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
