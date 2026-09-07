import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from '../../entities/pago.entity';
import { Turno } from '../../entities/turno.entity';
import { Paciente } from '../../entities/paciente.entity';
import { Sucursal } from '../../entities/sucursal.entity';
import { PagoService } from './application/pago.service';
import { PagoController } from './infrastructure/controllers/pago.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Turno, Paciente, Sucursal])],
  controllers: [PagoController],
  providers: [PagoService],
  exports: [PagoService],
})
export class PagoModule {}
