import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Diagnostico } from './diagnostico.entity';

@Entity('cie10')
export class Cie10 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  codigo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @OneToMany(() => Diagnostico, (d) => d.cie10)
  diagnosticos: Diagnostico[];
}
