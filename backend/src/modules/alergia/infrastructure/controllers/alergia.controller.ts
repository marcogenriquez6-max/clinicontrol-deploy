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
import { AlergiaService } from '../../application/alergia.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateAlergiaDto, UpdateAlergiaDto } from '../dto/create-alergia.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Alergias')
@ApiBearerAuth()
@Controller('alergias')
@Roles('medico', 'enfermeria')
export class AlergiaController {
  constructor(private readonly alergiaService: AlergiaService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las alergias' })
  findAll() {
    return this.alergiaService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar alergias por nombre o descripción' })
  search(@Query('q') query?: string) {
    return this.alergiaService.search(query || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener alergia por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alergiaService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva alergia' })
  create(@Body(ValidationPipe) dto: CreateAlergiaDto) {
    return this.alergiaService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar alergia' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateAlergiaDto,
  ) {
    return this.alergiaService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar alergia' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.alergiaService.delete(id);
  }
}
