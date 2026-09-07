import { Module } from '@nestjs/common';
import { ImpresionService } from '../application/impresion.service';
import { ImpresionController } from './controllers/impresion.controller';

@Module({
  controllers: [ImpresionController],
  providers: [ImpresionService],
  exports: [ImpresionService],
})
export class ImpresionModule {}
