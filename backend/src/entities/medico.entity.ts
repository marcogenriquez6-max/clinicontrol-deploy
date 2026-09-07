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
import { Cita } from './cita.entity';
import { Consulta } from './consulta.entity';
import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';
import { MedicoServicio } from './medico-servicio.entity';

@Entity('medico')
export class Medico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ type: 'text', array: true, default: [] })
  especialidades: string[];

  @Column({ name: 'especialidad_id', nullable: true })
  especialidadId: number;

  @ManyToOne(() => Especialidad, (e) => e.medicos, { nullable: true })
  @JoinColumn({ name: 'especialidad_id' })
  especialidad: Especialidad;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'codigo_medico', nullable: true })
  codigoMedico: string;

  @Column({ nullable: true })
  consultorio?: string;

  @Column({ name: 'sucursal_id', nullable: true })
  sucursalId: number;

  @ManyToOne(() => Sucursal, (s) => s.medicos)
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Cita, (c) => c.medico)
  citas: Cita[];

  @OneToMany(() => Consulta, (c) => c.medico)
  consultas: Consulta[];

  @OneToMany(() => MedicoServicio, (ms) => ms.medico)
  serviciosMedicos: MedicoServicio[];
}
