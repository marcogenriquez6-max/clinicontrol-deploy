import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Paciente } from './paciente.entity';
import { Turno } from './turno.entity';
import { Usuario } from './usuario.entity';

export type PagoEstado = 'pagado' | 'anulado';

/**
 * Registro simple de pago en efectivo asociado a la atención.
 * Coherente con el documento de grado: no hay sistema financiero completo,
 * solo el comprobante de que la atención fue pagada (recibo).
 */
@Entity('pago')
@Index('idx_pago_fecha', ['fecha'])
@Index('idx_pago_paciente', ['pacienteId'])
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'numero_recibo', type: 'varchar', length: 20, unique: true })
  numeroRecibo: string;

  @Column({ name: 'turno_id', nullable: true })
  turnoId?: number;

  @ManyToOne(() => Turno, { nullable: true })
  @JoinColumn({ name: 'turno_id' })
  turno?: Turno;

  @Column({ name: 'paciente_id' })
  pacienteId: number;

  @ManyToOne(() => Paciente)
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @Column({ type: 'varchar', length: 150 })
  concepto: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ name: 'metodo_pago', type: 'varchar', length: 20, default: 'efectivo' })
  metodoPago: string;

  @Column({ type: 'varchar', length: 20, default: 'pagado' })
  estado: PagoEstado;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ name: 'motivo_anulacion', type: 'text', nullable: true })
  motivoAnulacion?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
