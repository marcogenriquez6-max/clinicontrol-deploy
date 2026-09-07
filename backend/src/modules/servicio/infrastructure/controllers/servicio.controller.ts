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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ServicioService } from '../../application/servicio.service';
import {
  CreateServicioDto,
  UpdateServicioDto,
  ServicioQueryDto,
} from '../dto/create-servicio.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Servicios')
@ApiBearerAuth()
@Controller('servicios')
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  @Get()
  @Roles('admin', 'recepcionista', 'secretaria', 'medico', 'enfermeria')
  @ApiOperation({ summary: 'Listar servicios con filtros' })
  @ApiQuery({ name: 'especialidadId', required: false, type: Number })
  @ApiQuery({ name: 'activo', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() query: ServicioQueryDto) {
    return this.servicioService.findAll(query);
  }

  @Get('especialidad/:especialidadId')
  @Roles('admin', 'recepcionista', 'secretaria', 'medico', 'enfermeria')
  @ApiOperation({ summary: 'Obtener servicios por especialidad' })
  findByEspecialidad(@Param('especialidadId', ParseIntPipe) especialidadId: number) {
    return this.servicioService.findByEspecialidad(especialidadId);
  }

  @Get('medico/:medicoId')
  @Roles('admin', 'recepcionista', 'secretaria', 'medico', 'enfermeria')
  @ApiOperation({ summary: 'Obtener servicios habilitados para un médico' })
  findByMedico(@Param('medicoId', ParseIntPipe) medicoId: number) {
    return this.servicioService.findByMedico(medicoId);
  }

  @Get(':id')
  @Roles('admin', 'recepcionista', 'secretaria', 'medico', 'enfermeria')
  @ApiOperation({ summary: 'Obtener servicio por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicioService.findById(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear nuevo servicio' })
  create(@Body(ValidationPipe) dto: CreateServicioDto) {
    return this.servicioService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar servicio' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateServicioDto,
  ) {
    return this.servicioService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar servicio' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicioService.remove(id);
  }
}