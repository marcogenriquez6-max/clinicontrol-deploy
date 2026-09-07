import api from './axios';
import type { Alergia } from '../types';

export const alergiaService = {
  getAll: () => api.get<Alergia[]>('/alergias'),
  search: (q: string) => api.get<Alergia[]>(`/alergias/search?q=${q}`),
  getByPaciente: (pacienteId: number) => api.get<Alergia[]>(`/pacientes/${pacienteId}/alergias`),
  create: (data: Omit<Alergia, 'id'>) => api.post<Alergia>('/alergias', data),
  asignarAPaciente: (pacienteId: number, data: { alergiaId: number; severidad?: string }) => api.post(`/pacientes/${pacienteId}/alergias`, data),
  removeFromPaciente: (pacienteId: number, alergiaId: number) => api.delete(`/pacientes/${pacienteId}/alergias/${alergiaId}`),
};
