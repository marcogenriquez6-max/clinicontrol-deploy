import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Paciente } from './paciente.entity';
import { Medico } from './medico.entity';
import { Usuario } from './usuario.entity';

export enum BedStatus {
  DISPONIBLE = 'disponible',
  OCUPADO = 'ocupado',
  RESERVADO = 'reservado',
  LIMPIEZA = 'limpieza',
  MANTENIMIENTO = 'mantenimiento',
}

export enum AdmisionEstado {
  ADMITIDO = 'admitido',
  EN_OBSERVACION = 'en_observacion',
  INTERNADO = 'internado',
  ALTA = 'alta',
  TRASLADO = 'traslado',
  FALLECIDO = 'fallecido',
}

@Entity('cama')
@Index('idx_cama_estado', ['estado'])
@Index('idx_cama_servicio', ['servicio'])
export class Cama {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo_cama' })
  codigoCama: string;

  @Column()
  servicio: string;

  @Column({ nullable: true })
  piso: string;

  @Column({ nullable: true })
  habitacion: string;

  @Column({ type: 'varchar', length: 20, default: BedStatus.DISPONIBLE })
  estado: BedStatus;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('hospitalizacion')
@Index('idx_hosp_paciente', ['pacienteId'])
@Index('idx_hosp_estado', ['estado'])
@Index('idx_hosp_fechas', ['fechaIngreso', 'fechaAlta'])
export class Hospitalizacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'paciente_id' })
  pacienteId: number;

  @ManyToOne(() => Paciente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @Column({ name: 'medico_tratante_id' })
  medicoTratanteId: number;

  @ManyToOne(() => Medico)
  @JoinColumn({ name: 'medico_tratante_id' })
  medicoTratante: Medico;

  @Column({ name: 'cama_id' })
  camaId: number;

  @ManyToOne(() => Cama)
  @JoinColumn({ name: 'cama_id' })
  cama: Cama;

  @Column({ name: 'fecha_ingreso', type: 'timestamptz' })
  fechaIngreso: Date;

  @Column({ name: 'fecha_alta', type: 'timestamptz', nullable: true })
  fechaAlta: Date;

  @Column({ type: 'text', nullable: true })
  motivoIngreso: string;

  @Column({ type: 'text', nullable: true })
  diagnosticoIngreso: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'varchar', length: 20, default: AdmisionEstado.ADMITIDO })
  estado: AdmisionEstado;

  @Column({ name: 'usuario_registro_id' })
  usuarioRegistroId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_registro_id' })
  usuarioRegistro: Usuario;

  @Column({ type: 'text', nullable: true })
  notasAlta: string;

  @Column({ name: 'diagnostico_alta', type: 'text', nullable: true })
  diagnosticoAlta: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => NotaEvolucion, (n) => n.hospitalizacion)
  notasEvolucion: NotaEvolucion[];
}

@Entity('nota_evolucion')
@Index('idx_nota_hosp', ['hospitalizacionId'])
export class NotaEvolucion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'hospitalizacion_id' })
  hospitalizacionId: number;

  @ManyToOne(() => Hospitalizacion, (h) => h.notasEvolucion, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hospitalizacion_id' })
  hospitalizacion: Hospitalizacion;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'text' })
  nota: string;

  @Column({ type: 'text', nullable: true })
  plan: string;

  @Column({ type: 'text', nullable: true })
  indicaciones: string;

  @Column({ name: 'realizado_por' })
  realizadoPorId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'realizado_por' })
  realizadoPor: Usuario;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
