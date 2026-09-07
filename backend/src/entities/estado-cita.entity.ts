import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Cita } from './cita.entity';

@Entity('estado_cita')
export class EstadoCita {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  nombre: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Cita, (c) => c.estado)
  citas: Cita[];
}
