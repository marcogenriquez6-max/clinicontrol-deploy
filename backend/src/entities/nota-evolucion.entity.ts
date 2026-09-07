import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Consulta } from './consulta.entity';
import { Usuario } from './usuario.entity';

export enum TipoNotaEvolucion {
  EVOLUCION = 'evolucion',
  NOTA_MEDICA = 'nota_medica',
  REPORTE = 'reporte',
  INDICACION = 'indicacion',
  HOJA_ENFERMERIA = 'hoja_enfermeria',
}

@Entity('notas_evolucion')
export class NotaEvolucionConsulta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'consulta_id' })
  consultaId: number;

  @ManyToOne(() => Consulta, (c) => c.notasEvolucion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'consulta_id' })
  consulta: Consulta;

  @Column({ type: 'varchar', length: 30, default: TipoNotaEvolucion.EVOLUCION })
  tipo: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ name: 'creado_por' })
  creadoPorId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'creado_por' })
  creadoPor: Usuario;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
