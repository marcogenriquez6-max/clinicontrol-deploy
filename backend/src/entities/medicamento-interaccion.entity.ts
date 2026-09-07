import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Medicamento } from './receta-medicamento.entity';

export enum InteraccionSeveridad {
  LEVE = 'leve',
  MODERADA = 'moderada',
  SEVERA = 'severa',
  CONTRAINDICADA = 'contraindicada',
}

@Entity('medicamentos_interacciones')
export class MedicamentoInteraccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'medicamento_id_1' })
  medicamentoId1: number;

  @ManyToOne(() => Medicamento)
  @JoinColumn({ name: 'medicamento_id_1' })
  medicamento1: Medicamento;

  @Column({ name: 'medicamento_id_2' })
  medicamentoId2: number;

  @ManyToOne(() => Medicamento)
  @JoinColumn({ name: 'medicamento_id_2' })
  medicamento2: Medicamento;

  @Column({
    type: 'varchar',
    length: 20,
    default: InteraccionSeveridad.MODERADA,
  })
  severidad: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'text', nullable: true })
  recomendacion: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
