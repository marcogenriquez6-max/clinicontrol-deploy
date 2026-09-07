import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('caja_sessions')
export class CajaSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fecha_apertura', type: 'timestamptz' })
  fechaApertura: Date;

  @Column({ name: 'fecha_cierre', type: 'timestamptz', nullable: true })
  fechaCierre?: Date;

  @Column({
    name: 'monto_inicial',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  montoInicial: number;

  @Column({
    name: 'monto_final',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  montoFinal?: number;

  @Column({ type: 'varchar', length: 20, default: 'abierta' })
  estado: string;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
