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
import { EspecialidadService } from '../../application/especialidad.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  CreateEspecialidadDto,
  UpdateEspecialidadDto,
} from '../dto/create-especialidad.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Especialidades')
@ApiBearerAuth()
@Controller('especialidades')
@Roles('admin', 'medico', 'recepcionista', 'secretaria', 'enfermeria', 'gerente')
export class EspecialidadController {
  constructor(private readonly especialidadService: EspecialidadService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las especialidades' })
  findAll() {
    return this.especialidadService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener especialidad por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.especialidadService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva especialidad' })
  create(@Body(ValidationPipe) dto: CreateEspecialidadDto) {
    return this.especialidadService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar especialidad' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateEspecialidadDto,
  ) {
    return this.especialidadService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar especialidad' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.especialidadService.delete(id);
  }
}
