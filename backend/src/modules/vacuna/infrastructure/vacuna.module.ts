import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vacuna, PacienteVacuna } from '../../../entities/vacuna.entity';
import { VacunaService } from '../application/vacuna.service';
import { VacunaRepositoryPort } from '../domain/ports/vacuna-repository.port';
import { VacunaRepositoryAdapter } from './persistence/vacuna-repository.adapter';
import { VacunaController } from './controllers/vacuna.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vacuna, PacienteVacuna])],
  providers: [
    VacunaService,
    { provide: VacunaRepositoryPort, useClass: VacunaRepositoryAdapter },
  ],
  controllers: [VacunaController],
  exports: [VacunaService, VacunaRepositoryPort],
})
export class VacunaModule {}
