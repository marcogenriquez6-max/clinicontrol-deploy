import {
  HospitalizacionDomain,
  CamaDomain,
  NotaEvolucionDomain,
  BedStatus,
  AdmisionEstado,
} from '../hospitalizacion.domain';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HospitalizacionQuery {
  estado?: AdmisionEstado;
  pacienteId?: number;
  page?: number;
  limit?: number;
}

export abstract class HospitalizacionRepositoryPort {
  abstract create(
    data: Partial<HospitalizacionDomain>,
    usuarioId: number,
  ): Promise<HospitalizacionDomain>;
  abstract findAll(
    query: HospitalizacionQuery,
  ): Promise<{ data: HospitalizacionDomain[]; meta: PaginationMeta }>;
  abstract findById(id: number): Promise<HospitalizacionDomain | null>;
  abstract update(
    id: number,
    data: Partial<HospitalizacionDomain>,
  ): Promise<HospitalizacionDomain>;
  abstract darAlta(
    id: number,
    dto: { fechaAlta: Date; notasAlta?: string; diagnosticoAlta?: string },
  ): Promise<HospitalizacionDomain>;
  abstract softDelete(id: number): Promise<void>;
  abstract createCama(dto: Partial<CamaDomain>): Promise<CamaDomain>;
  abstract findAllCamas(servicio?: string): Promise<CamaDomain[]>;
  abstract findCamaById(id: number): Promise<CamaDomain | null>;
  abstract updateCama(
    id: number,
    data: Partial<CamaDomain>,
  ): Promise<CamaDomain>;
  abstract removeCama(id: number): Promise<void>;
  abstract getCamasDisponibles(servicio?: string): Promise<CamaDomain[]>;
  abstract createNotaEvolucion(
    hospId: number,
    dto: { fecha: string | Date; nota: string; plan?: string; indicaciones?: string },
    usuarioId: number,
  ): Promise<NotaEvolucionDomain>;
  abstract findNotasEvolucion(hospId: number): Promise<NotaEvolucionDomain[]>;
  abstract getStats(): Promise<{
    totalCamas: number;
    ocupadas: number;
    disponibles: number;
    enLimpieza: number;
    ocupacion: number;
  }>;
}
