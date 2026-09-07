import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Medico } from './medico.entity';

@Entity('horario_medico')
export class HorarioMedico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'medico_id' })
  medicoId: number;

  @ManyToOne(() => Medico)
  @JoinColumn({ name: 'medico_id' })
  medico: Medico;

  @Column({ name: 'dia_semana' })
  diaSemana: number;

  @Column({ type: 'time', name: 'hora_inicio' })
  horaInicio: string;

  @Column({ type: 'time', name: 'hora_fin' })
  horaFin: string;

  @Column({ type: 'time', name: 'hora_inicio_tarde', nullable: true })
  horaInicioTarde: string;

  @Column({ type: 'time', name: 'hora_fin_tarde', nullable: true })
  horaFinTarde: string;

  @Column({ name: 'duracion_slot_minutos', default: 30 })
  duracionSlotMinutos: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
