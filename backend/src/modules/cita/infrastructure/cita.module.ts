import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cita } from '../../../entities/cita.entity';
import { EstadoCita } from '../../../entities/estado-cita.entity';
import { Paciente } from '../../../entities/paciente.entity';
import { Medico } from '../../../entities/medico.entity';
import { Servicio } from '../../../entities/servicio.entity';
import { Consulta } from '../../../entities/consulta.entity';
import { CitaService } from '../application/cita.service';
import { CitaDomainService } from '../domain/services/cita-domain.service';
import { CitaRepositoryPort } from '../domain/ports/cita-repository.port';
import { CitaRepositoryAdapter } from './persistence/cita-repository.adapter';
import { CitaController } from './controllers/cita.controller';
import { TurnoModule } from '../../turno/infrastructure/turno.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cita,
      EstadoCita,
      Paciente,
      Medico,
      Servicio,
      Consulta,
    ]),
    TurnoModule,
  ],
  providers: [
    CitaService,
    CitaDomainService,
    {
      provide: CitaRepositoryPort,
      useClass: CitaRepositoryAdapter,
    },
  ],
  controllers: [CitaController],
  exports: [CitaService, CitaRepositoryPort],
})
export class CitaModule {}
