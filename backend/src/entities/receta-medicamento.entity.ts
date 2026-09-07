import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Consulta } from './consulta.entity';

@Entity('medicamento')
export class Medicamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  presentacion: string;

  @Column({ nullable: true })
  concentracion: string;

  @Column({ name: 'grupo_farmacologico', nullable: true })
  grupoFarmacologico: string;
}

@Entity('receta')
export class Receta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'consulta_id' })
  consultaId: number;

  @ManyToOne(() => Consulta, (c) => c.recetas)
  @JoinColumn({ name: 'consulta_id' })
  consulta: Consulta;

  @Column({ type: 'text', nullable: true })
  instrucciones: string;

  @Column({ default: 'activa' })
  estado: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => RecetaMedicamento, (rm) => rm.receta, { cascade: true })
  items: RecetaMedicamento[];
}

@Entity('receta_medicamento')
export class RecetaMedicamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'receta_id' })
  recetaId: number;

  @ManyToOne(() => Receta, (r) => r.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receta_id' })
  receta: Receta;

  @Column({ name: 'medicamento_id' })
  medicamentoId: number;

  @ManyToOne(() => Medicamento)
  @JoinColumn({ name: 'medicamento_id' })
  medicamento: Medicamento;

  @Column()
  dosis: string;

  @Column()
  frecuencia: string;

  @Column({ nullable: true })
  duracion: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'int', nullable: true })
  cantidad: number;

  @Column({ name: 'cantidad_dispensada', type: 'int', default: 0 })
  cantidadDispensada: number;
}
