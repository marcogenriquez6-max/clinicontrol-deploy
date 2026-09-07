import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turno } from '../../../entities/turno.entity';
import { TurnoService } from '../application/turno.service';
import { TurnoRepositoryPort } from '../domain/ports/turno-repository.port';
import { TurnoRepositoryAdapter } from './persistence/turno-repository.adapter';
import { TurnoController } from './controllers/turno.controller';
import { TriageModule } from '../../triage/infrastructure/triage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Turno]), TriageModule],
  providers: [
    TurnoService,
    {
      provide: TurnoRepositoryPort,
      useClass: TurnoRepositoryAdapter,
    },
  ],
  controllers: [TurnoController],
  exports: [TurnoService, TurnoRepositoryPort],
})
export class TurnoModule {}
