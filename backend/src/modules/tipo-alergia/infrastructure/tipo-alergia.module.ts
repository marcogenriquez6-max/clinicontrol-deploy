import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoAlergia } from '../../../entities/tipo-alergia.entity';
import { TipoAlergiaService } from '../application/tipo-alergia.service';
import { TipoAlergiaRepositoryPort } from '../domain/ports/tipo-alergia-repository.port';
import { TipoAlergiaRepositoryAdapter } from './persistence/tipo-alergia-repository.adapter';
import { TipoAlergiaController } from './controllers/tipo-alergia.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoAlergia])],
  providers: [
    TipoAlergiaService,
    {
      provide: TipoAlergiaRepositoryPort,
      useClass: TipoAlergiaRepositoryAdapter,
    },
  ],
  controllers: [TipoAlergiaController],
  exports: [TipoAlergiaService, TipoAlergiaRepositoryPort],
})
export class TipoAlergiaModule {}
