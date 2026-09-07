import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Consulta } from './consulta.entity';
import { Cie10 } from './cie10.entity';

@Entity('diagnostico')
export class Diagnostico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'consulta_id' })
  consultaId: number;

  @ManyToOne(() => Consulta, (c) => c.diagnosticos)
  @JoinColumn({ name: 'consulta_id' })
  consulta: Consulta;

  @Column({ name: 'cie10_id', nullable: true })
  cie10Id: number;

  @ManyToOne(() => Cie10, (c) => c.diagnosticos)
  @JoinColumn({ name: 'cie10_id' })
  cie10: Cie10;

  @Column({ nullable: true })
  codigo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ default: 'principal' })
  tipo: string;

  @Column({ type: 'text', nullable: true })
  recomendaciones: string;

  @Column({ name: 'es_cronico', default: false })
  esCronico: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
