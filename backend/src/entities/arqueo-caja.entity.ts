import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('arqueos_caja')
export class ArqueoCaja {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ name: 'monto_esperado', type: 'decimal', precision: 10, scale: 2 })
  montoEsperado: number;

  @Column({ name: 'monto_real', type: 'decimal', precision: 10, scale: 2 })
  montoReal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  diferencia: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId?: number;

  @Column({ name: 'caja_session_id', nullable: true })
  cajaSessionId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
