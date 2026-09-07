import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Paciente } from './paciente.entity';
import { Usuario } from './usuario.entity';

@Entity('vacuna')
export class Vacuna {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'dosis_recomendadas', default: 1 })
  dosisRecomendadas: number;

  @Column({ name: 'edad_minima_meses', nullable: true })
  edadMinimaMeses: number;

  @Column({ name: 'edad_maxima_meses', nullable: true })
  edadMaximaMeses: number;

  @Column({ name: 'intervalo_dias', nullable: true })
  intervalodias: number;

  @Column({ name: 'es_obligatoria', default: false })
  esObligatoria: boolean;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => PacienteVacuna, (pv) => pv.vacuna)
  aplicaciones: PacienteVacuna[];
}

@Entity('paciente_vacuna')
export class PacienteVacuna {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'paciente_id' })
  pacienteId: number;

  @Column({ name: 'vacuna_id' })
  vacunaId: number;

  @Column({ name: 'dosis_numero', default: 1 })
  dosisNumero: number;

  @Column({ name: 'fecha_aplicacion', type: 'date' })
  fechaAplicacion: string;

  @Column({ length: 50, nullable: true })
  lote: string;

  @Column({ length: 100, nullable: true })
  laboratorio: string;

  @Column({ name: 'lugar_aplicacion', length: 200, nullable: true })
  lugarAplicacion: string;

  @Column({ name: 'aplicado_por_id', nullable: true })
  aplicadoPorId: number;

  @Column({ name: 'proxima_dosis', type: 'date', nullable: true })
  proximaDosis: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Paciente, (paciente) => paciente.vacunas)
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @ManyToOne(() => Vacuna, (vacuna) => vacuna.aplicaciones)
  @JoinColumn({ name: 'vacuna_id' })
  vacuna: Vacuna;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'aplicado_por_id' })
  aplicadoPor: Usuario;
}
