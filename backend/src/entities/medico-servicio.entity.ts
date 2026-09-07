import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Medico } from './medico.entity';
import { Servicio } from './servicio.entity';

@Entity('medico_servicio')
@Unique(['medicoId', 'servicioId'])
export class MedicoServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'medico_id' })
  medicoId: number;

  @ManyToOne(() => Medico, (m) => m.serviciosMedicos)
  @JoinColumn({ name: 'medico_id' })
  medico: Medico;

  @Column({ name: 'servicio_id' })
  servicioId: number;

  @ManyToOne(() => Servicio, (s) => s.medicosServicios)
  @JoinColumn({ name: 'servicio_id' })
  servicio: Servicio;

  @Column({ default: true })
  activo: boolean;
}