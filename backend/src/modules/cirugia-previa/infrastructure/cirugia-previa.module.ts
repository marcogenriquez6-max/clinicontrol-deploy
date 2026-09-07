import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CirugiaPrevia } from '../../../entities/cirugia-previa.entity';
import { CirugiaPreviaService } from '../application/cirugia-previa.service';
import { CirugiaPreviaRepositoryPort } from '../domain/ports/cirugia-previa-repository.port';
import { CirugiaPreviaRepositoryAdapter } from './persistence/cirugia-previa-repository.adapter';
import { CirugiaPreviaController } from './controllers/cirugia-previa.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CirugiaPrevia])],
  providers: [
    CirugiaPreviaService,
    {
      provide: CirugiaPreviaRepositoryPort,
      useClass: CirugiaPreviaRepositoryAdapter,
    },
  ],
  controllers: [CirugiaPreviaController],
  exports: [CirugiaPreviaService, CirugiaPreviaRepositoryPort],
})
export class CirugiaPreviaModule {}
