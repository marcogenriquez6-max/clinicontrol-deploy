import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genero } from '../../../entities/genero.entity';
import { GeneroService } from '../application/genero.service';
import { GeneroRepositoryPort } from '../domain/ports/genero-repository.port';
import { GeneroRepositoryAdapter } from './persistence/genero-repository.adapter';
import { GeneroController } from './controllers/genero.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Genero])],
  providers: [
    GeneroService,
    { provide: GeneroRepositoryPort, useClass: GeneroRepositoryAdapter },
  ],
  controllers: [GeneroController],
  exports: [GeneroService, GeneroRepositoryPort],
})
export class GeneroModule {}
