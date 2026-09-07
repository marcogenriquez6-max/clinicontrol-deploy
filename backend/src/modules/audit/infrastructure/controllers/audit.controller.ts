import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from '../../application/audit.service';
import { Roles } from '../../../../common/decorators/roles.decorator';

function aFechaLocal(v: string, finDeDia: boolean): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return new Date(`${v}T${finDeDia ? '23:59:59.999' : '00:00:00'}`);
  }
  return new Date(v);
}

@ApiTags('Auditoría')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(AuthGuard('jwt'))
@Roles('admin', 'gerente')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Listar registros de auditoría' })
  async query(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.query({
      entityType,
      entityId,
      userId,
      action,
      // Fechas "solo día" (YYYY-MM-DD) se interpretan en hora local, no UTC.
      startDate: startDate ? aFechaLocal(startDate, false) : undefined,
      endDate: endDate ? aFechaLocal(endDate, true) : undefined,
      page: page || 1,
      limit: limit || 50,
    });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Actividad de un usuario' })
  async getUserActivity(@Param('userId') userId: string) {
    return this.auditService.getUserActivity(userId);
  }

  @Get(':entityType/:entityId')
  @ApiOperation({ summary: 'Historial de cambios de una entidad' })
  async getHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.getHistory(entityType, entityId);
  }
}
