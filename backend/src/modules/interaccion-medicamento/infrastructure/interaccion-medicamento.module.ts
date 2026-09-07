import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicamentoInteraccion } from '../../../entities/medicamento-interaccion.entity';
import { Alergia } from '../../../entities/alergia.entity';
import { Paciente } from '../../../entities/paciente.entity';
import { Medicamento } from '../../../entities/receta-medicamento.entity';
import { InteraccionMedicamentoService } from '../application/interaccion-medicamento.service';
import { InteraccionMedicamentoController } from './controllers/interaccion-medicamento.controller';
import { InteraccionMedicamentoRepositoryPort } from '../domain/ports/interaccion-medicamento-repository.port';
import { InteraccionMedicamentoRepositoryAdapter } from './persistence/interaccion-medicamento-repository.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicamentoInteraccion,
      Alergia,
      Paciente,
      Medicamento,
    ]),
  ],
  providers: [
    InteraccionMedicamentoService,
    {
      provide: InteraccionMedicamentoRepositoryPort,
      useClass: InteraccionMedicamentoRepositoryAdapter,
    },
  ],
  controllers: [InteraccionMedicamentoController],
  exports: [
    InteraccionMedicamentoService,
    InteraccionMedicamentoRepositoryPort,
  ],
})
export class InteraccionMedicamentoModule {}
