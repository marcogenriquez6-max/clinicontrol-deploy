import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Paciente } from './paciente.entity';
import { Medico } from './medico.entity';
import { Cita } from './cita.entity';
import { TipoAtencion } from './tipo-atencion.entity';

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  QR = 'qr',
  OTRO = 'otro',
}

@Entity('turno')
export class Turno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  prefijo?: string;

  @Column({ name: 'paciente_id' })
  pacienteId: number;

  @ManyToOne(() => Paciente)
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @Column({ name: 'medico_id' })
  medicoId: number;

  @ManyToOne(() => Medico)
  @JoinColumn({ name: 'medico_id' })
  medico: Medico;

  @Column({ name: 'cita_id', nullable: true })
  citaId?: number;

  @ManyToOne(() => Cita, { nullable: true })
  @JoinColumn({ name: 'cita_id' })
  cita?: Cita;

  @Column({ type: 'varchar', length: 20, default: 'espera' })
  estado: string;

  @Column({ name: 'tipo_atencion_id', nullable: true })
  tipoAtencionId?: number;

  @ManyToOne(() => TipoAtencion, { nullable: true })
  @JoinColumn({ name: 'tipo_atencion_id' })
  tipoAtencion?: TipoAtencion;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipo: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  consultorio?: string;

  @Column({ name: 'fecha_programada', type: 'date', nullable: true })
  fechaProgramada?: string;

  @Column({
    name: 'hora_programada',
    type: 'varchar',
    length: 5,
    nullable: true,
  })
  horaProgramada?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monto: number;

  @Column({ default: false })
  pagado: boolean;

  @Column({ name: 'pagado_en', type: 'timestamptz', nullable: true })
  pagadoEn?: Date;

  @Column({ name: 'metodo_pago', type: 'varchar', length: 20, nullable: true })
  metodoPago?: MetodoPago;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
