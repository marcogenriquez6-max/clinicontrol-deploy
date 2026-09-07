import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Sucursal } from '../../../../entities/sucursal.entity';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { AuditService } from '../../../../common/services/audit.service';
import { AuditAction } from '../../../../entities/audit-log.entity';

export interface ClinicaConfig {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  nit: string;
}

/**
 * Configuración institucional: datos de la Clínica Santa Isabel que aparecen
 * en recibos, recetas y reportes. Todo el personal los lee; el administrador los edita.
 */
@ApiTags('Configuración')
@ApiBearerAuth()
@Controller('configuracion')
export class ConfiguracionController {
  constructor(
    @InjectRepository(Sucursal) private readonly repo: Repository<Sucursal>,
    private readonly auditService: AuditService,
  ) {}

  private async actual(): Promise<Sucursal> {
    let s = await this.repo.findOne({ where: {}, order: { id: 'ASC' } });
    if (!s) {
      s = await this.repo.save(
        this.repo.create({ nombre: 'Clínica Santa Isabel', activo: true }),
      );
    }
    return s;
  }

  private toConfig(s: Sucursal): ClinicaConfig {
    return {
      nombre: s.nombre,
      direccion: s.direccion ?? '',
      telefono: s.telefono ?? '',
      email: s.email ?? '',
      nit: s.rnc ?? '',
    };
  }

  @Get('clinica')
  @Roles('admin', 'gerente', 'secretaria', 'medico', 'recepcionista', 'enfermeria')
  @ApiOperation({ summary: 'Datos de la clínica (para recibos, recetas y reportes)' })
  async clinica(): Promise<ClinicaConfig> {
    return this.toConfig(await this.actual());
  }

  @Put('clinica')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar datos de la clínica' })
  async actualizar(
    @Body() body: Partial<ClinicaConfig>,
    @CurrentUser() user: { id: number; email: string },
  ): Promise<ClinicaConfig> {
    const s = await this.actual();
    const nombre = (body.nombre ?? s.nombre ?? '').toString().trim();
    if (nombre.length < 3) {
      throw new BadRequestException('El nombre de la clínica es obligatorio');
    }
    const anterior = this.toConfig(s);
    s.nombre = nombre;
    if (body.direccion !== undefined) s.direccion = String(body.direccion).slice(0, 500);
    if (body.telefono !== undefined) s.telefono = String(body.telefono).slice(0, 50);
    if (body.email !== undefined) s.email = String(body.email).slice(0, 200);
    if (body.nit !== undefined) s.rnc = String(body.nit).slice(0, 20);
    const saved = await this.repo.save(s);
    this.auditService
      .log({
        userId: String(user.id),
        userEmail: user.email,
        action: AuditAction.UPDATE,
        entityType: 'configuracion',
        entityId: 'clinica',
        oldValue: anterior,
        newValue: this.toConfig(saved),
      })
      .catch(() => {});
    return this.toConfig(saved);
  }
}
