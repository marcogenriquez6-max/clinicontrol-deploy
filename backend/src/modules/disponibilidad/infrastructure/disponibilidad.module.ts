import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorarioMedico } from '../../../entities/horario-medico.entity';
import { BloqueoAgenda } from '../../../entities/bloqueo-agenda.entity';
import { Cita } from '../../../entities/cita.entity';
import { Turno } from '../../../entities/turno.entity';
import { MedicoServicio } from '../../../entities/medico-servicio.entity';
import { Servicio } from '../../../entities/servicio.entity';
import { DisponibilidadService } from '../application/disponibilidad.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      HorarioMedico,
      BloqueoAgenda,
      Cita,
      Turno,
      MedicoServicio,
      Servicio,
    ]),
  ],
  providers: [DisponibilidadService],
  exports: [DisponibilidadService],
})
export class DisponibilidadModule {}
