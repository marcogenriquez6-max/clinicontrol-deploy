import api from './axios';
import type { Servicio, TipoAtencion, BloqueoAgendaTipo } from '../types';

export const servicioService = {
  getAll: (params?: { especialidadId?: number; activo?: boolean; page?: number; limit?: number }) =>
    api.get<Servicio[]>('/servicios', { params }),
  getById: (id: number) => api.get<Servicio>(`/servicios/${id}`),
  getByEspecialidad: (especialidadId: number) => api.get<Servicio[]>(`/servicios/especialidad/${especialidadId}`),
  getByMedico: (medicoId: number) => api.get<Servicio[]>(`/servicios/medico/${medicoId}`),
  create: (data: Partial<Servicio>) => api.post<Servicio>('/servicios', data),
  update: (id: number, data: Partial<Servicio>) => api.put<Servicio>(`/servicios/${id}`, data),
  delete: (id: number) => api.delete(`/servicios/${id}`),
};

export const tipoAtencionService = {
  getAll: () => api.get<TipoAtencion[]>('/tipo-atencion'),
  getById: (id: number) => api.get<TipoAtencion>(`/tipo-atencion/${id}`),
  create: (data: Partial<TipoAtencion>) => api.post<TipoAtencion>('/tipo-atencion', data),
  update: (id: number, data: Partial<TipoAtencion>) => api.put<TipoAtencion>(`/tipo-atencion/${id}`, data),
  delete: (id: number) => api.delete(`/tipo-atencion/${id}`),
};

export const agendaService = {
  getHorarios: (medicoId: number) => api.get(`/agenda/medico/${medicoId}/horarios`),
  setHorario: (medicoId: number, data: any) => api.post(`/agenda/medico/${medicoId}/horarios`, data),
  deleteHorario: (id: number) => api.delete(`/agenda/horarios/${id}`),
  getSlots: (medicoId: number, fecha: string) => api.get(`/agenda/medico/${medicoId}/slots`, { params: { fecha } }),
  getAgenda: (medicoId: number, fecha: string) => api.get(`/agenda/medico/${medicoId}/agenda`, { params: { fecha } }),
  bloquearFecha: (medicoId: number, data: { fechaInicio: string; fechaFin: string; horaInicio?: string; horaFin?: string; tipo?: BloqueoAgendaTipo; motivo: string }) =>
    api.post(`/agenda/medico/${medicoId}/bloqueos`, data),
  getBloqueos: (medicoId: number) => api.get(`/agenda/medico/${medicoId}/bloqueos`),
  deleteBloqueo: (id: number) => api.delete(`/agenda/bloqueos/${id}`),
  getAgendaMedico: (medicoId: number, fecha: string) => api.get(`/agenda/medico/${medicoId}/agenda`, { params: { fecha } }),
};