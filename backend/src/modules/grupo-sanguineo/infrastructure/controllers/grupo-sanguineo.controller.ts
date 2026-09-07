import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GrupoSanguineoService } from '../../application/grupo-sanguineo.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Grupos Sanguíneos')
@ApiBearerAuth()
@Controller('grupos-sanguineos')
@Roles('admin', 'medico', 'recepcionista', 'secretaria', 'enfermeria')
export class GrupoSanguineoController {
  constructor(private readonly grupoSanguineoService: GrupoSanguineoService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los grupos sanguíneos' })
  findAll() {
    return this.grupoSanguineoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener grupo sanguíneo por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.grupoSanguineoService.findOne(id);
  }
}
