import api from './axios';

export interface Cama {
  id: number;
  codigoCama: string;
  servicio: string;
  piso?: string;
  habitacion?: string;
  estado: string;
}

export interface Hospitalizacion {
  id: number;
  pacienteId: number;
  medicoTratanteId: number;
  camaId: number;
  fechaIngreso: string;
  fechaAlta?: string | null;
  motivoIngreso?: string;
  diagnosticoIngreso?: string;
  observaciones?: string;
  estado: string;
}

export interface HospStats {
  totalCamas: number;
  ocupadas: number;
  disponibles: number;
  enLimpieza: number;
  ocupacion: number;
}

export const camaService = {
  getAll: () => api.get<Cama[]>('/camas'),
  getDisponibles: () => api.get<Cama[]>('/camas/disponibles'),
};

export const hospitalizacionService = {
  getAll: () => api.get<Hospitalizacion[]>('/hospitalizacion'),
  getStats: () => api.get<HospStats>('/hospitalizacion/stats'),
  create: (data: {
    pacienteId: number;
    medicoTratanteId: number;
    camaId: number;
    fechaIngreso: string;
    motivoIngreso: string;
    diagnosticoIngreso?: string;
    observaciones?: string;
  }) => api.post<Hospitalizacion>('/hospitalizacion', data),
  alta: (id: number, data: { fechaAlta: string; notasAlta?: string; diagnosticoAlta?: string }) =>
    api.post(`/hospitalizacion/${id}/alta`, data),
  addNota: (id: number, data: { fecha: string; nota: string; plan?: string; indicaciones?: string }) =>
    api.post(`/hospitalizacion/${id}/notas`, data),
  getNotas: (id: number) => api.get(`/hospitalizacion/${id}/notas`),
};
