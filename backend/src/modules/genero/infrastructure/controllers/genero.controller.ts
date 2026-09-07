import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GeneroService } from '../../application/genero.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Géneros')
@ApiBearerAuth()
@Controller('generos')
@Roles('admin', 'medico', 'recepcionista', 'secretaria', 'enfermeria')
export class GeneroController {
  constructor(private readonly generoService: GeneroService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los géneros' })
  findAll() {
    return this.generoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener género por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.generoService.findOne(id);
  }
}
