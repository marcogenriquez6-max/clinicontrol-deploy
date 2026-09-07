import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrupoSanguineo } from '../../../entities/grupo-sanguineo.entity';
import { GrupoSanguineoService } from '../application/grupo-sanguineo.service';
import { GrupoSanguineoRepositoryPort } from '../domain/ports/grupo-sanguineo-repository.port';
import { GrupoSanguineoRepositoryAdapter } from './persistence/grupo-sanguineo-repository.adapter';
import { GrupoSanguineoController } from './controllers/grupo-sanguineo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GrupoSanguineo])],
  providers: [
    GrupoSanguineoService,
    {
      provide: GrupoSanguineoRepositoryPort,
      useClass: GrupoSanguineoRepositoryAdapter,
    },
  ],
  controllers: [GrupoSanguineoController],
  exports: [GrupoSanguineoService, GrupoSanguineoRepositoryPort],
})
export class GrupoSanguineoModule {}
