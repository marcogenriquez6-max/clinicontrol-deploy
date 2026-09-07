import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Especialidad } from '../../../entities/especialidad.entity';
import { EspecialidadService } from '../application/especialidad.service';
import { EspecialidadRepositoryPort } from '../domain/ports/especialidad-repository.port';
import { EspecialidadRepositoryAdapter } from './persistence/especialidad-repository.adapter';
import { EspecialidadController } from './controllers/especialidad.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Especialidad])],
  providers: [
    EspecialidadService,
    {
      provide: EspecialidadRepositoryPort,
      useClass: EspecialidadRepositoryAdapter,
    },
  ],
  controllers: [EspecialidadController],
  exports: [EspecialidadService, EspecialidadRepositoryPort],
})
export class EspecialidadModule {}
