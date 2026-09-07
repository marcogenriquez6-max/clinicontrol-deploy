import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Paciente } from './paciente.entity';

@Entity('cirugia_previa')
export class CirugiaPrevia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'paciente_id' })
  pacienteId: number;

  @Column({ name: 'nombre_procedimiento', length: 300 })
  nombreProcedimiento: string;

  @Column({ name: 'fecha_cirugia', type: 'date', nullable: true })
  fechaCirugia: string;

  @Column({ length: 200, nullable: true })
  hospital: string;

  @Column({ name: 'medico_cirujano', length: 200, nullable: true })
  medicoCirujano: string;

  @Column({ name: 'tipo_anestesia', length: 100, nullable: true })
  tipoAnestesia: string;

  @Column({ type: 'text', nullable: true })
  complicaciones: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Paciente, (paciente) => paciente.cirugiasPrevias)
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;
}
