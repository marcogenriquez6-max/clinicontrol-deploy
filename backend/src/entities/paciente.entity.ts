import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Genero } from './genero.entity';
import { GrupoSanguineo } from './grupo-sanguineo.entity';
import { Usuario } from './usuario.entity';
import { Cita } from './cita.entity';
import { Consulta } from './consulta.entity';
import { Alergia } from './alergia.entity';
import { PacienteVacuna } from './vacuna.entity';
import { CirugiaPrevia } from './cirugia-previa.entity';
import { Sucursal } from './sucursal.entity';

@Entity('paciente')
export class Paciente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  ci: string;

  @Column({ name: 'fecha_nacimiento', type: 'date' })
  fechaNacimiento: Date;

  @Column({ name: 'genero_id' })
  generoId: number;

  @ManyToOne(() => Genero, (g) => g.pacientes)
  @JoinColumn({ name: 'genero_id' })
  genero: Genero;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'grupo_sanguineo_id', nullable: true })
  grupoSanguineoId: number;

  @Column({ nullable: true })
  especialidad: string;

  @Column({ name: 'contacto_emergencia_nombre', nullable: true })
  contactoEmergenciaNombre: string;

  @Column({ name: 'contacto_emergencia_telefono', nullable: true })
  contactoEmergenciaTelefono: string;

  @ManyToOne(() => GrupoSanguineo, (g) => g.pacientes)
  @JoinColumn({ name: 'grupo_sanguineo_id' })
  grupoSanguineo: GrupoSanguineo;

  @Column({ name: 'usuario_registro_id' })
  usuarioRegistroId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_registro_id' })
  usuarioRegistro: Usuario;

  @Column({ name: 'sucursal_id', nullable: true })
  sucursalId: number;

  @ManyToOne(() => Sucursal, (s) => s.pacientes)
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;

  @Column({ default: true })
  activo: boolean;

  @ManyToMany(() => Alergia, (a) => a.pacientes)
  @JoinTable({
    name: 'pacientes_alergias',
    joinColumn: { name: 'paciente_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'alergia_id', referencedColumnName: 'id' },
  })
  alergias: Alergia[];

  @OneToMany(() => PacienteVacuna, (pv) => pv.paciente)
  vacunas: PacienteVacuna[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Cita, (c) => c.paciente)
  citas: Cita[];

  @OneToMany(() => Consulta, (c) => c.paciente)
  consultas: Consulta[];

  @OneToMany(() => CirugiaPrevia, (cp) => cp.paciente)
  cirugiasPrevias: CirugiaPrevia[];
}
