import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medico } from '../../../entities/medico.entity';
import { Usuario } from '../../../entities/usuario.entity';
import { MedicoServicio } from '../../../entities/medico-servicio.entity';
import { MedicoService } from '../application/medico.service';
import { MedicoRepositoryPort } from '../domain/ports/medico-repository.port';
import { MedicoRepositoryAdapter } from './persistence/medico-repository.adapter';
import { MedicoController } from './controllers/medico.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Medico, Usuario, MedicoServicio])],
  providers: [
    MedicoService,
    {
      provide: MedicoRepositoryPort,
      useClass: MedicoRepositoryAdapter,
    },
  ],
  controllers: [MedicoController],
  exports: [MedicoService, MedicoRepositoryPort],
})
export class MedicoModule {}
