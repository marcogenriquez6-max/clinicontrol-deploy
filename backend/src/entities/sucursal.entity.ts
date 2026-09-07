import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Medico } from './medico.entity';
import { Paciente } from './paciente.entity';

@Entity('sucursal')
export class Sucursal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 500, nullable: true })
  direccion: string;

  @Column({ length: 50, nullable: true })
  telefono: string;

  @Column({ length: 200, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  rnc: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'fecha_activacion', type: 'date', nullable: true })
  fechaActivacion: string;

  @Column({ name: 'fecha_expiracion', type: 'date', nullable: true })
  fechaExpiracion: string;

  @OneToMany(() => Medico, (m) => m.sucursal)
  medicos: Medico[];

  @OneToMany(() => Paciente, (p) => p.sucursal)
  pacientes: Paciente[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
