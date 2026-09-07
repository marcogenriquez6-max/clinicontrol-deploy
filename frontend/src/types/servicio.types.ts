import type { Especialidad, Medico } from "./medico.types";

export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  especialidadId: number;
  especialidad?: Especialidad;
  duracionMinutos: number;
  monto: number;
  activo: boolean;
  requierePreparacion: boolean;
  preparacionInstrucciones?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicoServicio {
  id: number;
  medicoId: number;
  servicioId: number;
  medico?: Medico;
  servicio?: Servicio;
  activo: boolean;
}