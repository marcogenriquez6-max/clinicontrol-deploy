import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Paciente } from './paciente.entity';
import { Usuario } from './usuario.entity';

export enum ESILevel {
  UNO = 1,
  DOS = 2,
  TRES = 3,
  CUATRO = 4,
  CINCO = 5,
}

export enum TriageEstado {
  ACTIVO = 'activo',
  EN_ESPERA = 'en_espera',
  EN_ATENCION = 'en_atencion',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

@Entity('triage')
@Index('idx_triage_paciente', ['pacienteId'])
@Index('idx_triage_estado', ['estado'] as (keyof Triage)[])
@Index('idx_triage_esi', ['esiNivel'] as (keyof Triage)[])
export class Triage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'paciente_id' })
  pacienteId: number;

  @ManyToOne(() => Paciente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @Column({ name: 'realizado_por' })
  realizadoPorId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'realizado_por' })
  realizadoPor: Usuario;

  @Column({ name: 'fecha_hora', type: 'timestamptz' })
  fechaHora: Date;

  @Column({ name: 'fecha_atencion', type: 'timestamptz', nullable: true })
  fechaAtencion: Date;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'varchar', length: 20, default: TriageEstado.ACTIVO })
  estado: string;

  @Column({ name: 'esi_nivel', type: 'int', default: ESILevel.TRES })
  esiNivel: ESILevel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  temperatura: number;

  @Column({ name: 'frecuencia_cardiaca', nullable: true })
  frecuenciaCardiaca: number;

  @Column({
    name: 'presion_arterial',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  presionArterial: string;

  @Column({ name: 'frecuencia_respiratoria', nullable: true })
  frecuenciaRespiratoria: number;

  @Column({
    name: 'saturacion_oxigeno',
    type: 'decimal',
    precision: 4,
    scale: 1,
    nullable: true,
  })
  saturacionOxigeno: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  peso: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  talla: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  glucosa: number;

  @Column({ name: 'motivo_consulta', type: 'text', nullable: true })
  motivoConsulta: string;

  @Column({ name: 'enfermedad_actual', type: 'text', nullable: true })
  enfermedadActual: string;

  @Column({ type: 'text', nullable: true })
  alergias: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
