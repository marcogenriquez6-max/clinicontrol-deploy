import api from './axios';
import type { Cita } from '../types';

export const citaService = {
  getAll: () => api.get<Cita[]>('/citas'),
  getById: (id: number) => api.get<Cita>(`/citas/${id}`),
  getByPaciente: (id: number) => api.get<Cita[]>('/citas', { params: { pacienteId: id } }),
  getByMedico: (id: number) => api.get<Cita[]>(`/citas/medico/${id}`),
  getByDate: (fecha: string) => api.get<Cita[]>(`/citas/fecha/${fecha}`),
  create: (data: Partial<Cita>) => api.post<Cita>('/citas', data),
  update: (id: number, data: Partial<Cita>) => api.put<Cita>(`/citas/${id}`, data),
  cancel: (id: number, motivo: string) => api.put(`/citas/${id}/cancelar`, { motivo }),
  llegada: (id: number) => api.post(`/citas/${id}/llegada`, {}),
  reprogramar: (id: number, data: { fecha: string; horaInicio: string; servicioId?: number }) =>
    api.patch<Cita>(`/citas/${id}/reprogramar`, data),
  getSlots: (medicoId: number, fecha: string, servicioId?: number) =>
    api.get<Array<{ horaInicio: string; horaFin: string; disponible: boolean; estado: string }>>(
      `/citas/medico/${medicoId}/slots`,
      { params: { fecha, ...(servicioId ? { servicioId } : {}) } }
    ),
  delete: (id: number) => api.delete(`/citas/${id}`),
};
