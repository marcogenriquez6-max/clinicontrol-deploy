import { ConsultaDomain } from '../consulta.domain';

export class ConsultaQuery {
  pacienteId?: number;
  medicoId?: number;
  fecha?: Date;
  page?: number;
  limit?: number;
}

export abstract class ConsultaRepositoryPort {
  abstract findById(id: number): Promise<ConsultaDomain | null>;
  abstract findAll(query: ConsultaQuery): Promise<{
    data: ConsultaDomain[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>;
  abstract save(consulta: ConsultaDomain): Promise<ConsultaDomain>;
  abstract update(
    id: number,
    data: Partial<ConsultaDomain>,
  ): Promise<ConsultaDomain>;
  abstract findByPacienteId(pacienteId: number): Promise<ConsultaDomain[]>;
  abstract findByIdWithRelations(
    id: number,
    relations: string[],
  ): Promise<ConsultaDomain | null>;
  abstract getHistorialCompleto(pacienteId: number): Promise<{
    consultas: ConsultaDomain[];
    notasEvolucion: any[];
  }>;
  abstract agregarNota(data: {
    consultaId: number;
    creadoPorId: number;
    contenido: string;
    tipo?: string;
  }): Promise<any>;
}
