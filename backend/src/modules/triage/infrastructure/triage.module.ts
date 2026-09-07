import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Triage } from '../../../entities/triage.entity';
import { TriageService } from '../application/triage.service';
import { TriageRepositoryPort } from '../domain/ports/triage-repository.port';
import { TriageRepositoryAdapter } from './persistence/triage-repository.adapter';
import { TriageController } from './controllers/triage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Triage])],
  providers: [
    TriageService,
    {
      provide: TriageRepositoryPort,
      useClass: TriageRepositoryAdapter,
    },
  ],
  controllers: [TriageController],
  exports: [TriageService, TriageRepositoryPort],
})
export class TriageModule {}
