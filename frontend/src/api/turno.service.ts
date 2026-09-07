import api from './axios';
import type { Turno } from '../types';

export const turnoService = {
  getAll: (params?: { estado?: string; medicoId?: number; pacienteId?: number; fecha?: string; pagado?: boolean; page?: number; limit?: number }) =>
    api.get<Turno[]>('/turnos', { params }),
  /** Turnos emitidos hoy (el médico solo ve los suyos, con marca de urgencia). */
  getHoy: (fecha?: string) => api.get<Turno[]>('/turnos/hoy', { params: fecha ? { fecha } : undefined }),
  getById: (id: number) => api.get<Turno>(`/turnos/${id}`),
  getTV: () => api.get<Turno[]>('/turnos/tv'),
  create: (data: { pacienteId: number; medicoId: number; citaId?: number; tipoAtencionId?: number; tipo?: string; monto: number; pagado?: boolean; fechaProgramada?: string; horaProgramada?: string }) =>
    api.post<Turno>('/turnos', data),
  updateEstado: (id: number, estado: string) =>
    api.put<Turno>(`/turnos/${id}/estado`, { estado }),
  remove: (id: number) => api.delete(`/turnos/${id}`),
};
