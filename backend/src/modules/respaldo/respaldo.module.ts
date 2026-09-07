import { Module } from '@nestjs/common';
import { RespaldoService } from './application/respaldo.service';
import { RespaldoController } from './infrastructure/controllers/respaldo.controller';

@Module({
  controllers: [RespaldoController],
  providers: [RespaldoService],
})
export class RespaldoModule {}
