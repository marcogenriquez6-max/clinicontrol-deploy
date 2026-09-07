import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorarioMedico } from '../../../entities/horario-medico.entity';
import { BloqueoAgenda } from '../../../entities/bloqueo-agenda.entity';
import { Cita } from '../../../entities/cita.entity';
import { AgendaService } from '../application/agenda.service';
import { AgendaRepositoryPort } from '../domain/ports/agenda-repository.port';
import { AgendaRepositoryAdapter } from './persistence/agenda-repository.adapter';
import { AgendaController } from './controllers/agenda.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HorarioMedico, BloqueoAgenda, Cita])],
  providers: [
    AgendaService,
    {
      provide: AgendaRepositoryPort,
      useClass: AgendaRepositoryAdapter,
    },
  ],
  controllers: [AgendaController],
  exports: [AgendaService, AgendaRepositoryPort],
})
export class AgendaModule {}
