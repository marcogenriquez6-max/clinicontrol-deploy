import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArqueoCaja } from '../../../entities/arqueo-caja.entity';
import { ArqueoService } from '../application/arqueo.service';
import { ArqueoRepositoryPort } from '../domain/ports/arqueo-repository.port';
import { ArqueoRepositoryAdapter } from './persistence/arqueo-repository.adapter';
import { ArqueoController } from './controllers/arqueo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ArqueoCaja])],
  providers: [
    ArqueoService,
    { provide: ArqueoRepositoryPort, useClass: ArqueoRepositoryAdapter },
  ],
  controllers: [ArqueoController],
})
export class ArqueoModule {}
