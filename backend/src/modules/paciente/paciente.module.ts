import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paciente } from '../../entities/paciente.entity';
import { Alergia } from '../../entities/alergia.entity';
import { Diagnostico } from '../../entities/diagnostico.entity';
import { PacienteController } from './infrastructure/controllers/paciente.controller';
import { PacienteService } from './application/paciente.service';
import { PacienteDomainService } from './domain/services/paciente-domain.service';
import { PacienteRepositoryAdapter } from './infrastructure/persistence/paciente-repository.adapter';
import { PacienteRepositoryPort } from './domain/ports/paciente-repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([Paciente, Alergia, Diagnostico])],
  controllers: [PacienteController],
  providers: [
    PacienteService,
    PacienteDomainService,
    {
      provide: PacienteRepositoryPort,
      useClass: PacienteRepositoryAdapter,
    },
  ],
  exports: [PacienteService, PacienteRepositoryPort],
})
export class PacienteModule {}
