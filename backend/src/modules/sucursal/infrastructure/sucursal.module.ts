import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sucursal } from '../../../entities/sucursal.entity';
import { SucursalService } from '../application/sucursal.service';
import { SucursalRepositoryPort } from '../domain/ports/sucursal-repository.port';
import { SucursalRepositoryAdapter } from './persistence/sucursal-repository.adapter';
import { SucursalController } from './controllers/sucursal.controller';
import { ConfiguracionController } from './controllers/configuracion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sucursal])],
  providers: [
    SucursalService,
    { provide: SucursalRepositoryPort, useClass: SucursalRepositoryAdapter },
  ],
  controllers: [SucursalController, ConfiguracionController],
  exports: [SucursalService, SucursalRepositoryPort],
})
export class SucursalModule {}
