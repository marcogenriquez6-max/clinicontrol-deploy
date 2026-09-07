import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Rol } from './rol.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Index({ unique: true })
  @Column({ unique: true })
  ci: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ name: 'rol_id' })
  rolId: number;

  @ManyToOne(() => Rol, (r) => r.usuarios)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @Column({ default: false })
  bloqueado: boolean;

  @Column({ nullable: true })
  bloqueado_motivo: string;

  @Column({ default: 0 })
  intentos_fallidos: number;

  @Column({ nullable: true, type: 'timestamptz' })
  ultimo_login: Date | null;

  @Column({ nullable: true })
  @Exclude()
  mfa_secret: string;

  @Column({ default: false })
  mfa_enabled: boolean;

  @Column({ nullable: true, length: 10 })
  mfa_method: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
