import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consulta } from '../../entities/consulta.entity';
import { Diagnostico } from '../../entities/diagnostico.entity';
import {
  Receta,
  RecetaMedicamento,
} from '../../entities/receta-medicamento.entity';
import { NotaEvolucionConsulta } from '../../entities/nota-evolucion.entity';
import { ConsultaController } from './infrastructure/controllers/consulta.controller';
import { ConsultaService } from './application/consulta.service';
import { ConsultaDomainService } from './domain/services/consulta-domain.service';
import { InmutabilidadExpedienteService } from './domain/services/inmutabilidad-expediente.service';
import { ConsultaRepositoryPort } from './domain/ports/consulta-repository.port';
import { ConsultaRepositoryAdapter } from './infrastructure/persistence/consulta-repository.adapter';
import { PacienteModule } from '../paciente/paciente.module';
import { MedicoModule } from '../medico/infrastructure/medico.module';
import { RecetaModule } from '../receta/infrastructure/receta.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consulta,
      Diagnostico,
      Receta,
      RecetaMedicamento,
      NotaEvolucionConsulta,
    ]),
    PacienteModule,
    MedicoModule,
    forwardRef(() => RecetaModule),
  ],
  controllers: [ConsultaController],
  providers: [
    ConsultaService,
    ConsultaDomainService,
    InmutabilidadExpedienteService,
    { provide: ConsultaRepositoryPort, useClass: ConsultaRepositoryAdapter },
  ],
  exports: [ConsultaService, ConsultaRepositoryPort],
})
export class ConsultaModule {}
