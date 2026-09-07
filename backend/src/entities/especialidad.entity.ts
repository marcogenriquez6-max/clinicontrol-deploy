import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Medico } from './medico.entity';
import { Servicio } from './servicio.entity';

@Entity('especialidad')
export class Especialidad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo?: string;

  @OneToMany(() => Medico, (m) => m.especialidad)
  medicos: Medico[];

  @OneToMany(() => Servicio, (s) => s.especialidad)
  servicios: Servicio[];
}
