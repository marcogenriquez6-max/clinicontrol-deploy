import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { UsuarioService } from '../../application/usuario.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUsuarioDto, UpdateUsuarioDto } from '../dto/create-usuario.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('usuarios')
@Roles('admin')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  create(@Body(ValidationPipe) dto: CreateUsuarioDto) {
    return this.usuarioService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateUsuarioDto,
  ) {
    return this.usuarioService.update(id, dto);
  }

  @Patch(':id/rol')
  @ApiOperation({ summary: 'Cambiar rol de usuario' })
  cambiarRol(
    @Param('id', ParseIntPipe) id: number,
    @Body('rolId', ValidationPipe) rolId: number,
  ) {
    return this.usuarioService.cambiarRol(id, rolId);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de usuario (activar/desactivar)' })
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo', ValidationPipe) activo: boolean,
    @CurrentUser() user: { id: number },
  ) {
    return this.usuarioService.cambiarEstado(id, activo, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.delete(id);
  }
}
