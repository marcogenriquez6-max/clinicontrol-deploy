import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoAtencion } from '../../../entities/tipo-atencion.entity';
import { TipoAtencionService } from '../application/tipo-atencion.service';
import { TipoAtencionRepositoryPort } from '../domain/ports/tipo-atencion-repository.port';
import { TipoAtencionRepositoryAdapter } from './persistence/tipo-atencion-repository.adapter';
import { TipoAtencionController } from './controllers/tipo-atencion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoAtencion])],
  providers: [
    TipoAtencionService,
    {
      provide: TipoAtencionRepositoryPort,
      useClass: TipoAtencionRepositoryAdapter,
    },
  ],
  controllers: [TipoAtencionController],
  exports: [TipoAtencionService, TipoAtencionRepositoryPort],
})
export class TipoAtencionModule {}
