import api from './axios';
import type { HorarioMedico, SlotDisponible, BloqueoAgenda } from '../types';

export const agendaService = {
  getHorarios: (medicoId: number) => api.get<HorarioMedico[]>(`/agenda/medico/${medicoId}/horarios`),
  setHorario: (medicoId: number, data: Partial<HorarioMedico>) => api.post<HorarioMedico>(`/agenda/medico/${medicoId}/horarios`, data),
  deleteHorario: (id: number) => api.delete(`/agenda/horarios/${id}`),
  getSlots: (medicoId: number, fecha: string) => api.get<SlotDisponible[]>(`/agenda/medico/${medicoId}/slots`, { params: { fecha } }),
  getAgenda: (medicoId: number, fecha: string) => api.get<HorarioMedico[]>(`/agenda/medico/${medicoId}/agenda`, { params: { fecha } }),
  bloquear: (medicoId: number, data: Omit<BloqueoAgenda, 'id' | 'medicoId'>) => api.post<BloqueoAgenda>(`/agenda/medico/${medicoId}/bloqueos`, data),
  getBloqueos: (medicoId: number) => api.get<BloqueoAgenda[]>(`/agenda/medico/${medicoId}/bloqueos`),
  deleteBloqueo: (id: number) => api.delete(`/agenda/bloqueos/${id}`),
};
