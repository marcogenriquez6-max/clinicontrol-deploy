import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alergia } from '../../../entities/alergia.entity';
import { AlergiaService } from '../application/alergia.service';
import { AlergiaRepositoryPort } from '../domain/ports/alergia-repository.port';
import { AlergiaRepositoryAdapter } from './persistence/alergia-repository.adapter';
import { AlergiaController } from './controllers/alergia.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Alergia])],
  providers: [
    AlergiaService,
    { provide: AlergiaRepositoryPort, useClass: AlergiaRepositoryAdapter },
  ],
  controllers: [AlergiaController],
  exports: [AlergiaService, AlergiaRepositoryPort],
})
export class AlergiaModule {}
