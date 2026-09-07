import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Paciente } from './paciente.entity';

export enum AlergiaSeveridad {
  LEVE = 'leve',
  MODERADA = 'moderada',
  SEVERA = 'severa',
  ANOFILACTICA = 'anafilactica',
}

@Entity('alergias')
export class Alergia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 20, default: AlergiaSeveridad.LEVE })
  severidad: string;

  @ManyToMany(() => Paciente, (p) => p.alergias)
  pacientes: Paciente[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
