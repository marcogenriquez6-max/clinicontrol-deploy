import { TurnoDomain, EstadoTurno, MetodoPago } from '../turno.domain';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TurnoQuery {
  estado?: string;
  medicoId?: number;
  pacienteId?: number;
  /** Día (YYYY-MM-DD) en que se emitió el turno */
  fecha?: string;
  pagado?: boolean;
  page?: number;
  limit?: number;
}

export abstract class TurnoRepositoryPort {
  abstract findAll(query: TurnoQuery): Promise<{
    data: TurnoDomain[];
    meta: PaginationMeta;
  }>;

  abstract findById(id: number): Promise<TurnoDomain | null>;

  abstract findTV(): Promise<TurnoDomain[]>;

  /** Último número emitido HOY para el prefijo (la numeración reinicia cada día). */
  abstract getUltimoNumero(prefijo?: string): Promise<number>;

  abstract save(turno: TurnoDomain): Promise<TurnoDomain>;

  abstract updateEstado(id: number, estado: EstadoTurno): Promise<TurnoDomain>;

  abstract marcarPagado(id: number, metodoPago?: MetodoPago): Promise<TurnoDomain>;

  abstract remove(id: number): Promise<void>;
}
