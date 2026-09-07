import api from './axios';

/** Registro de triaje tal como lo devuelve el backend (TriageDomain). */
export interface Triage {
  id: number;
  pacienteId: number;
  realizadoPorId?: number;
  fechaHora: string;
  fechaAtencion?: string | null;
  activo: boolean;
  estado: 'activo' | 'en_espera' | 'en_atencion' | 'completado' | 'cancelado' | string;
  esiNivel: number;
  temperatura?: number;
  frecuenciaCardiaca?: number;
  presionArterial?: string;
  frecuenciaRespiratoria?: number;
  saturacionOxigeno?: number;
  peso?: number;
  talla?: number;
  glucosa?: number;
  motivoConsulta?: string;
  enfermedadActual?: string;
  alergias?: string;
  createdAt?: string;
}

export interface CreateTriageInput {
  pacienteId: number;
  esiNivel: number;
  temperatura?: number;
  frecuenciaCardiaca?: number;
  presionSistolica?: number;
  presionDiastolica?: number;
  frecuenciaRespiratoria?: number;
  spo2?: number;
  glucosa?: number;
  peso?: number;
  talla?: number;
  motivoConsulta?: string;
  observaciones?: string;
  alergias?: string;
}

export const triageService = {
  getAll: (params?: { estado?: string; pacienteId?: number; page?: number; limit?: number }) =>
    api.get<Triage[]>('/triage', { params }),
  getActivos: () => api.get<Triage[]>('/triage/activos'),
  getByPaciente: (pacienteId: number) => api.get<Triage[]>(`/triage/paciente/${pacienteId}`),
  getUltimoByPaciente: (pacienteId: number) => api.get<Triage>(`/triage/paciente/${pacienteId}/ultimo`),
  getById: (id: number) => api.get<Triage>(`/triage/${id}`),
  create: (data: CreateTriageInput) => api.post<Triage>('/triage', data),
  cambiarEstado: (id: number, estado: string) => api.patch<Triage>(`/triage/${id}/estado`, { estado }),
};
