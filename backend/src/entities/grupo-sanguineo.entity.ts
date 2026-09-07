import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Paciente } from './paciente.entity';

@Entity('grupo_sanguineo')
export class GrupoSanguineo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToMany(() => Paciente, (p) => p.grupoSanguineo)
  pacientes: Paciente[];
}
