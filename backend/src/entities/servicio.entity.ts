import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Especialidad } from './especialidad.entity';
import { MedicoServicio } from './medico-servicio.entity';

@Entity('servicio')
export class Servicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'especialidad_id' })
  especialidadId: number;

  @ManyToOne(() => Especialidad, (e) => e.servicios)
  @JoinColumn({ name: 'especialidad_id' })
  especialidad: Especialidad;

  @Column({ name: 'duracion_minutos', type: 'integer', default: 30 })
  duracionMinutos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  monto: number;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'requiere_preparacion', default: false })
  requierePreparacion: boolean;

  @Column({ type: 'text', nullable: true })
  preparacionInstrucciones: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => MedicoServicio, (ms) => ms.servicio)
  medicosServicios: MedicoServicio[];
}