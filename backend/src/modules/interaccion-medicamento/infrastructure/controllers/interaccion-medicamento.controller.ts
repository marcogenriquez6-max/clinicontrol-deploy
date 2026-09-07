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
import { InteraccionMedicamentoService } from '../../application/interaccion-medicamento.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  CreateInteraccionDto,
  UpdateInteraccionDto,
  VerificarInteraccionesDto,
  VerificarInteraccionesPacienteDto,
} from '../dto/create-interaccion.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Interacciones Medicamentosas')
@ApiBearerAuth()
@Controller('interacciones')
@Roles('medico')
export class InteraccionMedicamentoController {
  constructor(
    private readonly interaccionService: InteraccionMedicamentoService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las interacciones' })
  findAll() {
    return this.interaccionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener interacción por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.interaccionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva interacción medicamentosa' })
  create(@Body(ValidationPipe) dto: CreateInteraccionDto) {
    return this.interaccionService.create(dto);
  }

  @Post('verificar')
  @ApiOperation({ summary: 'Verificar interacciones entre medicamentos' })
  verificarInteracciones(@Body(ValidationPipe) dto: VerificarInteraccionesDto) {
    return this.interaccionService.verificarInteracciones(dto.medicamentoIds);
  }

  @Post('verificar/paciente')
  @ApiOperation({
    summary:
      'Verificar interacciones entre medicamentos y alergias del paciente',
  })
  verificarConAlergias(
    @Body(ValidationPipe) dto: VerificarInteraccionesPacienteDto,
  ) {
    return this.interaccionService.verificarInteraccionesConAlergias(
      dto.pacienteId,
      dto.medicamentoIds,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar interacción' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateInteraccionDto,
  ) {
    return this.interaccionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar interacción' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.interaccionService.delete(id);
  }
}
