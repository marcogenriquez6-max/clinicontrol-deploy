import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diagnostico } from '../../../entities/diagnostico.entity';
import { Cie10 } from '../../../entities/cie10.entity';
import { DiagnosticoService } from '../application/diagnostico.service';
import { DiagnosticoRepositoryPort } from '../domain/ports/diagnostico-repository.port';
import { DiagnosticoRepositoryAdapter } from './persistence/diagnostico-repository.adapter';
import { DiagnosticoController } from './controllers/diagnostico.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Diagnostico, Cie10])],
  providers: [
    DiagnosticoService,
    {
      provide: DiagnosticoRepositoryPort,
      useClass: DiagnosticoRepositoryAdapter,
    },
  ],
  controllers: [DiagnosticoController],
  exports: [DiagnosticoService, DiagnosticoRepositoryPort],
})
export class DiagnosticoModule {}
