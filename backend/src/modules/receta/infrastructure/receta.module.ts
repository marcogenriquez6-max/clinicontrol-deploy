import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Receta as RecetaOrm,
  RecetaMedicamento as RecetaMedicamentoOrm,
  Medicamento as MedicamentoOrm,
} from '../../../entities/receta-medicamento.entity';
import { Paciente } from '../../../entities/paciente.entity';
import { MedicamentoInteraccion } from '../../../entities/medicamento-interaccion.entity';
import { RecetaService } from '../application/receta.service';
import { RecetaDomainService } from '../domain/services/receta-domain.service';
import { SeguridadFarmacologicaService } from '../domain/services/seguridad-farmacologica.service';
import { RecetaRepositoryPort } from '../domain/ports/receta-repository.port';
import { MedicamentoRepositoryPort } from '../domain/ports/medicamento-repository.port';
import { HistoricoTratamientoServicePort } from '../domain/ports/historico-tratamiento-service.port';
import { RecetaRepositoryAdapter } from './persistence/receta-repository.adapter';
import { MedicamentoRepositoryAdapter } from './persistence/medicamento-repository.adapter';
import { RecetaController } from './controllers/receta.controller';
import { RecetaPdfService } from './receta-pdf.service';
import { HistoricoTratamientoService } from '../../historico-tratamiento/application/historico-tratamiento.service';
import { HistoricoTratamientoModule } from '../../historico-tratamiento/infrastructure/historico-tratamiento.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecetaOrm,
      RecetaMedicamentoOrm,
      MedicamentoOrm,
      Paciente,
      MedicamentoInteraccion,
    ]),
    HistoricoTratamientoModule,
  ],
  providers: [
    RecetaService,
    RecetaDomainService,
    SeguridadFarmacologicaService,
    RecetaPdfService,
    {
      provide: RecetaRepositoryPort,
      useClass: RecetaRepositoryAdapter,
    },
    {
      provide: MedicamentoRepositoryPort,
      useClass: MedicamentoRepositoryAdapter,
    },
    {
      provide: HistoricoTratamientoServicePort,
      useExisting: HistoricoTratamientoService,
    },
  ],
  controllers: [RecetaController],
  exports: [RecetaService, RecetaRepositoryPort],
})
export class RecetaModule {}
