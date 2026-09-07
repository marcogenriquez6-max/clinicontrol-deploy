import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from '../../../entities/rol.entity';
import { RolService } from '../application/rol.service';
import { RolRepositoryPort } from '../domain/ports/rol-repository.port';
import { RolRepositoryAdapter } from './persistence/rol-repository.adapter';
import { RolController } from './controllers/rol.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rol])],
  providers: [
    RolService,
    { provide: RolRepositoryPort, useClass: RolRepositoryAdapter },
  ],
  controllers: [RolController],
  exports: [RolService, RolRepositoryPort],
})
export class RolModule {}
