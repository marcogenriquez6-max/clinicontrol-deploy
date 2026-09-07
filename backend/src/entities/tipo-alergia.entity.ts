import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Catalogo de tipos de alergia (medicamentosa, alimentaria, ambiental...).
 *
 * La severidad base orienta al personal al registrar una alergia nueva: es el
 * punto de partida sugerido, no una imposicion. La severidad definitiva se
 * guarda en cada alergia concreta del paciente.
 */
@Entity('tipo_alergia')
export class TipoAlergia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ name: 'severidad_base', length: 20, default: 'moderada' })
  severidadBase: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;
}
