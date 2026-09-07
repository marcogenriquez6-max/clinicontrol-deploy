import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum TipoAtencionTipo {
  CONSULTA_NUEVA = 'consulta_nueva',
  RECONSULTA = 'reconsulta',
}

@Entity('tipo_atencion')
export class TipoAtencion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({
    name: 'tipo',
    type: 'enum',
    enum: TipoAtencionTipo,
    default: TipoAtencionTipo.CONSULTA_NUEVA,
  })
  tipo: TipoAtencionTipo;

  @Column({ name: 'duracion_minutos', type: 'integer', default: 30 })
  duracionMinutos?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  monto: number;

  @Column({ default: true })
  activo: boolean;
}
