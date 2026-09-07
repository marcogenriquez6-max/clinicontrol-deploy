import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servicio } from '../../../entities/servicio.entity';
import { MedicoServicio } from '../../../entities/medico-servicio.entity';
import { Especialidad } from '../../../entities/especialidad.entity';
import { ServicioService } from '../application/servicio.service';
import { ServicioRepositoryPort } from '../domain/ports/servicio-repository.port';
import { ServicioRepositoryAdapter } from './persistence/servicio-repository.adapter';
import { ServicioController } from './controllers/servicio.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Servicio, MedicoServicio, Especialidad])],
  providers: [
    ServicioService,
    {
      provide: ServicioRepositoryPort,
      useClass: ServicioRepositoryAdapter,
    },
  ],
  controllers: [ServicioController],
  exports: [ServicioService, ServicioRepositoryPort],
})
export class ServicioModule {}