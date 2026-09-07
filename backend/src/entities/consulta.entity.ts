import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Paciente } from './paciente.entity';
import { Medico } from './medico.entity';
import { Cita } from './cita.entity';
import { Diagnostico } from './diagnostico.entity';
import { Receta } from './receta-medicamento.entity';
import { Sucursal } from './sucursal.entity';
import { NotaEvolucionConsulta } from './nota-evolucion.entity';

@Entity('consulta')
export class Consulta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'paciente_id' })
  pacienteId: number;

  @ManyToOne(() => Paciente, (p) => p.consultas)
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @Column({ name: 'medico_id' })
  medicoId: number;

  @ManyToOne(() => Medico, (m) => m.consultas)
  @JoinColumn({ name: 'medico_id' })
  medico: Medico;

  @Column({ name: 'cita_id', nullable: true })
  citaId: number;

  @OneToOne(() => Cita, (c) => c.consulta)
  @JoinColumn({ name: 'cita_id' })
  cita: Cita;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @Column({ type: 'text', nullable: true })
  sintomas: string;

  @Column({ type: 'text', nullable: true })
  examenFisico: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'enfermedad_actual', type: 'text', nullable: true })
  enfermedadActual: string;

  @Column({ type: 'text', nullable: true })
  evaluacion: string;

  @Column({ name: 'plan_tratamiento', type: 'text', nullable: true })
  planTratamiento: string;

  @Column({ type: 'text', nullable: true })
  indicaciones: string;

  @Column({ name: 'glucosa_capilar', nullable: true })
  glucosaCapilar: number;

  @OneToMany(() => Diagnostico, (d) => d.consulta)
  diagnosticos: Diagnostico[];

  @OneToMany(() => Receta, (r) => r.consulta)
  recetas: Receta[];

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  temperatura: number;

  @Column({ name: 'frecuencia_cardiaca', nullable: true })
  frecuenciaCardiaca: number;

  @Column({ name: 'presion_arterial_sistolica', nullable: true })
  presionArterialSistolica: number;

  @Column({ name: 'presion_arterial_diastolica', nullable: true })
  presionArterialDiastolica: number;

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
  imc: number;

  @Column({ name: 'es_virtual', default: false })
  esVirtual: boolean;

  @Column({ name: 'sucursal_id', nullable: true })
  sucursalId: number;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;

  @OneToMany(() => NotaEvolucionConsulta, (n) => n.consulta)
  notasEvolucion: NotaEvolucionConsulta[];

  @Column({ name: 'es_continuacion', default: false })
  esContinuacion: boolean;

  @Column({ name: 'consulta_original_id', nullable: true })
  consultaOriginalId: number;

  @ManyToOne(() => Consulta, { nullable: true })
  @JoinColumn({ name: 'consulta_original_id' })
  consultaOriginal: Consulta;

  @Column({ name: 'motivo_continuacion', type: 'text', nullable: true })
  motivoContinuacion: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
