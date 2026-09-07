import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Medico } from './medico.entity';

export enum BloqueoAgendaTipo {
  AUSENCIA_COMPLETA = 'ausencia_completa',
  BLOQUEO_PARCIAL = 'bloqueo_parcial',
}

@Entity('bloqueo_agenda')
export class BloqueoAgenda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'medico_id' })
  medicoId: number;

  @ManyToOne(() => Medico)
  @JoinColumn({ name: 'medico_id' })
  medico: Medico;

  @Column({ type: 'date', name: 'fecha_inicio' })
  fechaInicio: string;

  @Column({ type: 'date', name: 'fecha_fin' })
  fechaFin: string;

  @Column({ type: 'time', name: 'hora_inicio', nullable: true })
  horaInicio: string;

  @Column({ type: 'time', name: 'hora_fin', nullable: true })
  horaFin: string;

  @Column({
    name: 'tipo',
    type: 'enum',
    enum: BloqueoAgendaTipo,
    default: BloqueoAgendaTipo.AUSENCIA_COMPLETA,
  })
  tipo: BloqueoAgendaTipo;

  @Column({ length: 300 })
  motivo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
