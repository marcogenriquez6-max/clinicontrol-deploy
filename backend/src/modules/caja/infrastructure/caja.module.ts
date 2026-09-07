import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CajaSession } from '../../../entities/caja.entity';
import { CajaService } from '../application/caja.service';
import { CajaRepositoryPort } from '../domain/ports/caja-repository.port';
import { CajaRepositoryAdapter } from './persistence/caja-repository.adapter';
import { CajaController } from './controllers/caja.controller';
import { TurnoModule } from '../../turno/infrastructure/turno.module';

@Module({
  imports: [TypeOrmModule.forFeature([CajaSession]), TurnoModule],
  providers: [
    CajaService,
    { provide: CajaRepositoryPort, useClass: CajaRepositoryAdapter },
  ],
  controllers: [CajaController],
  exports: [CajaService],
})
export class CajaModule {}
