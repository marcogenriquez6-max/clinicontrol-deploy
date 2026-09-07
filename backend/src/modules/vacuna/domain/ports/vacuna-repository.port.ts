import { VacunaDomain } from '../vacuna.domain';

export interface PacienteVacunaRow {
  id: number;
  pacienteId: number;
  vacunaId: number;
  dosisNumero: number;
  fechaAplicacion: string;
  lote: string | null;
  laboratorio: string | null;
  lugarAplicacion: string | null;
  aplicadoPorId: number | null;
  proximaDosis: string | null;
  observaciones: string | null;
  createdAt: Date;
  vacuna?: VacunaDomain;
}

export abstract class VacunaRepositoryPort {
  abstract findAll(): Promise<VacunaDomain[]>;
  abstract findById(id: number): Promise<VacunaDomain | null>;
  abstract create(data: Partial<VacunaDomain>): Promise<VacunaDomain>;
  abstract update(
    id: number,
    data: Partial<VacunaDomain>,
  ): Promise<VacunaDomain>;
  abstract delete(id: number): Promise<void>;
  abstract search(query: string): Promise<VacunaDomain[]>;
  abstract findActivos(): Promise<VacunaDomain[]>;

  abstract findAplicacionesByPacienteId(
    pacienteId: number,
  ): Promise<PacienteVacunaRow[]>;
  abstract createAplicacion(data: {
    pacienteId: number;
    vacunaId: number;
    dosisNumero?: number;
    fechaAplicacion: string;
    lote?: string;
    laboratorio?: string;
    lugarAplicacion?: string;
    aplicadoPorId?: number;
    proximaDosis?: string;
    observaciones?: string;
  }): Promise<PacienteVacunaRow>;
  abstract deleteAplicacion(id: number): Promise<void>;
}
