import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from '../application/reports.service';
import { ReportsRepositoryPort } from '../domain/ports/reports-repository.port';
import { ReportsRepositoryAdapter } from './persistence/reports-repository.adapter';
import { ReportsController } from './controllers/reports.controller';
import { ReportesTesisController } from './controllers/reportes-tesis.controller';
import { ReportesTesisService } from '../application/reportes-tesis.service';
import { Paciente } from '../../../entities/paciente.entity';
import { Cita } from '../../../entities/cita.entity';
import { Consulta } from '../../../entities/consulta.entity';
import { Receta } from '../../../entities/receta-medicamento.entity';
import { Medico } from '../../../entities/medico.entity';
import { Turno } from '../../../entities/turno.entity';
import { Cama } from '../../../entities/hospitalizacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente, Cita, Consulta, Receta, Medico, Turno, Cama]),
  ],
  providers: [
    ReportsService,
    ReportesTesisService,
    {
      provide: ReportsRepositoryPort,
      useClass: ReportsRepositoryAdapter,
    },
  ],
  controllers: [ReportsController, ReportesTesisController],
  exports: [ReportsService, ReportesTesisService],
})
export class ReportsModule {}
