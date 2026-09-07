import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../../entities/usuario.entity';
import { UsuarioService } from '../application/usuario.service';
import { UsuarioRepositoryPort } from '../domain/ports/usuario-repository.port';
import { UsuarioRepositoryAdapter } from './persistence/usuario-repository.adapter';
import { UsuarioController } from './controllers/usuario.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [
    UsuarioService,
    {
      provide: UsuarioRepositoryPort,
      useClass: UsuarioRepositoryAdapter,
    },
  ],
  controllers: [UsuarioController],
  exports: [UsuarioService, UsuarioRepositoryPort],
})
export class UsuarioModule {}
