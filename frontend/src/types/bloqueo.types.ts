export type BloqueoAgendaTipo = 'ausencia_completa' | 'bloqueo_parcial';

import type { Medico } from "./medico.types";

export interface BloqueoAgenda {
  id: number;
  medicoId: number;
  medico?: Medico;
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;
  tipo: BloqueoAgendaTipo;
  motivo: string;
  createdAt?: string;
}