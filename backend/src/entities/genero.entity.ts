import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Paciente } from './paciente.entity';

@Entity('genero')
export class Genero {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToMany(() => Paciente, (p) => p.genero)
  pacientes: Paciente[];
}
