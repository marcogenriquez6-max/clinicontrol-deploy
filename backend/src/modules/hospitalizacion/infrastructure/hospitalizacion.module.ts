import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Hospitalizacion,
  Cama,
  NotaEvolucion,
} from '../../../entities/hospitalizacion.entity';
import { HospitalizacionService } from '../application/hospitalizacion.service';
import { HospitalizacionRepositoryPort } from '../domain/ports/hospitalizacion-repository.port';
import { HospitalizacionRepositoryAdapter } from './persistence/hospitalizacion-repository.adapter';
import {
  HospitalizacionController,
  CamaController,
} from './controllers/hospitalizacion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Hospitalizacion, Cama, NotaEvolucion])],
  providers: [
    HospitalizacionService,
    {
      provide: HospitalizacionRepositoryPort,
      useClass: HospitalizacionRepositoryAdapter,
    },
  ],
  controllers: [HospitalizacionController, CamaController],
  exports: [HospitalizacionService, HospitalizacionRepositoryPort],
})
export class HospitalizacionModule {}
