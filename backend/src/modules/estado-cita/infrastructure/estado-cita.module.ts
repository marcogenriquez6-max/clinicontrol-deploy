import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoCita } from '../../../entities/estado-cita.entity';
import { EstadoCitaService } from '../application/estado-cita.service';
import { EstadoCitaRepositoryPort } from '../domain/ports/estado-cita-repository.port';
import { EstadoCitaRepositoryAdapter } from './persistence/estado-cita-repository.adapter';
import { EstadoCitaController } from './controllers/estado-cita.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoCita])],
  providers: [
    EstadoCitaService,
    {
      provide: EstadoCitaRepositoryPort,
      useClass: EstadoCitaRepositoryAdapter,
    },
  ],
  controllers: [EstadoCitaController],
  exports: [EstadoCitaService, EstadoCitaRepositoryPort],
})
export class EstadoCitaModule {}
