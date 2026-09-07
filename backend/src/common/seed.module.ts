import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Rol } from '../entities/rol.entity';
import { Genero } from '../entities/genero.entity';
import { GrupoSanguineo } from '../entities/grupo-sanguineo.entity';
import { Cie10 } from '../entities/cie10.entity';
import { Especialidad } from '../entities/especialidad.entity';
import {
  Medicamento,
  Receta,
  RecetaMedicamento,
} from '../entities/receta-medicamento.entity';
import { Usuario } from '../entities/usuario.entity';
import { Paciente } from '../entities/paciente.entity';
import { Medico } from '../entities/medico.entity';
import { EstadoCita } from '../entities/estado-cita.entity';
import { Cita } from '../entities/cita.entity';
import { Consulta } from '../entities/consulta.entity';
import { Diagnostico } from '../entities/diagnostico.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Alergia } from '../entities/alergia.entity';
import { MedicamentoInteraccion } from '../entities/medicamento-interaccion.entity';
import { TipoAtencion } from '../entities/tipo-atencion.entity';
import { Turno } from '../entities/turno.entity';
import { Triage } from '../entities/triage.entity';
import { Cama, Hospitalizacion } from '../entities/hospitalizacion.entity';
import { Vacuna } from '../entities/vacuna.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rol,
      Genero,
      GrupoSanguineo,
      Cie10,
      Especialidad,
      Medicamento,
      Usuario,
      Paciente,
      Medico,
      EstadoCita,
      Cita,
      Consulta,
      Diagnostico,
      Receta,
      RecetaMedicamento,
      Sucursal,
      Alergia,
      MedicamentoInteraccion,
      TipoAtencion,
      Turno,
      Triage,
      Cama,
      Hospitalizacion,
      Vacuna,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeedModule {}
