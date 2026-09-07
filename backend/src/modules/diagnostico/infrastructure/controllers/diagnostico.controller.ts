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
  ValidationPipe,
} from '@nestjs/common';
import { DiagnosticoService } from '../../application/diagnostico.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  CreateDiagnosticoDto,
  UpdateDiagnosticoDto,
} from '../dto/create-diagnostico.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Diagnósticos')
@ApiBearerAuth()
@Controller('diagnosticos')
@Roles('medico', 'enfermeria')
export class DiagnosticoController {
  constructor(private readonly diagnosticoService: DiagnosticoService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los diagnósticos' })
  findAll() {
    return this.diagnosticoService.findAll();
  }

  @Get('cie10')
  @ApiOperation({ summary: 'Buscar diagnósticos CIE-10' })
  findCie10(@Query('q') query?: string) {
    return this.diagnosticoService.findCie10(query);
  }

  @Get('consulta/:consultaId')
  @ApiOperation({ summary: 'Obtener diagnósticos por consulta' })
  findByConsulta(@Param('consultaId', ParseIntPipe) consultaId: number) {
    return this.diagnosticoService.findByConsulta(consultaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener diagnóstico por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.diagnosticoService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo diagnóstico' })
  create(@Body(ValidationPipe) dto: CreateDiagnosticoDto) {
    return this.diagnosticoService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar diagnóstico' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateDiagnosticoDto,
  ) {
    return this.diagnosticoService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar diagnóstico' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.diagnosticoService.delete(id);
  }
}
