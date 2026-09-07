import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditController } from './controllers/audit.controller';
import { AuditService } from '../application/audit.service';
import { AuditRepositoryPort } from '../domain/ports/audit-repository.port';
import { AuditRepositoryAdapter } from './persistence/audit-repository.adapter';
import { AuditLog } from '../../../entities/audit-log.entity';
import { Usuario } from '../../../entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, Usuario])],
  controllers: [AuditController],
  providers: [
    AuditService,
    { provide: AuditRepositoryPort, useClass: AuditRepositoryAdapter },
  ],
  exports: [AuditService, AuditRepositoryPort],
})
export class AuditModule {}
