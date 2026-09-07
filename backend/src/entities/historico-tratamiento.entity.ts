import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Paciente } from './paciente.entity';
import { Medicamento, Receta } from './receta-medicamento.entity';
import { Consulta } from './consulta.entity';
import { Medico } from './medico.entity';

@Entity('historico_tratamiento')
export class HistoricoTratamiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'paciente_id' })
  pacienteId: number;

  @Column({ name: 'medicamento_id' })
  medicamentoId: number;

  @Column({ name: 'consulta_id', nullable: true })
  consultaId: number;

  @Column({ name: 'receta_id', nullable: true })
  recetaId: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: string;

  @Column({ length: 100 })
  dosis: string;

  @Column({ length: 100 })
  frecuencia: string;

  @Column({ name: 'via_administracion_id', nullable: true })
  viaAdministracionId: number;

  @Column({ length: 20, default: 'activo' })
  estado: string;

  @Column({ name: 'motivo_cambio', type: 'text', nullable: true })
  motivoCambio: string;

  @Column({ name: 'medico_id', nullable: true })
  medicoId: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Paciente)
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @ManyToOne(() => Medicamento)
  @JoinColumn({ name: 'medicamento_id' })
  medicamento: Medicamento;

  @ManyToOne(() => Consulta)
  @JoinColumn({ name: 'consulta_id' })
  consulta: Consulta;

  @ManyToOne(() => Receta, { nullable: true })
  @JoinColumn({ name: 'receta_id' })
  receta: Receta;

  @ManyToOne(() => Medico)
  @JoinColumn({ name: 'medico_id' })
  medico: Medico;
}
