import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RolService } from '../../application/rol.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateRolDto, UpdateRolDto } from '../dto/create-rol.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ROLE_PERMISSIONS } from '../../../../common/constants/permissions';
import { MODULOS_POR_ROL, DESCRIPCION_ROL } from '../../../../common/constants/modulos-rol';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@Roles('admin')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles' })
  findAll() {
    return this.rolService.findAll();
  }

  @Get('permisos')
  @ApiOperation({ summary: 'Matriz de permisos y módulos por rol (solo lectura)' })
  permisos() {
    const roles = Object.keys(MODULOS_POR_ROL);
    return roles.map((rol) => ({
      rol,
      descripcion: DESCRIPCION_ROL[rol] ?? '',
      modulos: MODULOS_POR_ROL[rol],
      permisos: ROLE_PERMISSIONS[rol] ?? [],
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear rol' })
  create(@Body() dto: CreateRolDto) {
    return this.rolService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar rol' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRolDto) {
    return this.rolService.update(id, dto);
  }
}
