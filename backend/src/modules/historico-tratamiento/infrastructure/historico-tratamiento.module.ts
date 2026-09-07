import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoricoTratamiento } from '../../../entities/historico-tratamiento.entity';
import { HistoricoTratamientoService } from '../application/historico-tratamiento.service';
import { HistoricoTratamientoRepositoryPort } from '../domain/ports/historico-tratamiento-repository.port';
import { HistoricoTratamientoRepositoryAdapter } from './persistence/historico-tratamiento-repository.adapter';
import { HistoricoTratamientoController } from './controllers/historico-tratamiento.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HistoricoTratamiento])],
  providers: [
    HistoricoTratamientoService,
    {
      provide: HistoricoTratamientoRepositoryPort,
      useClass: HistoricoTratamientoRepositoryAdapter,
    },
  ],
  controllers: [HistoricoTratamientoController],
  exports: [HistoricoTratamientoService, HistoricoTratamientoRepositoryPort],
})
export class HistoricoTratamientoModule {}
