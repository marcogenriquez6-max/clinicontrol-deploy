import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TipoAlergiaService } from '../../application/tipo-alergia.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Tipos de alergia')
@ApiBearerAuth()
@Controller('tipos-alergia')
@Roles('admin', 'medico', 'recepcionista', 'secretaria', 'enfermeria')
export class TipoAlergiaController {
  constructor(private readonly tipoAlergiaService: TipoAlergiaService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el catálogo de tipos de alergia' })
  findAll() {
    return this.tipoAlergiaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de alergia por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoAlergiaService.findOne(id);
  }
}
