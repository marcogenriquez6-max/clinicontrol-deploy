import api from './axios';
import type { Vacuna, PacienteVacuna, CalendarioVacuna } from '../types';

export const vacunaService = {
  getAll: () => api.get<Vacuna[]>('/vacunas'),
  search: (q: string) => api.get<Vacuna[]>(`/vacunas/search?q=${q}`),
  getByPaciente: (pacienteId: number) => api.get<PacienteVacuna[]>(`/vacunas/paciente/${pacienteId}`),
  getCalendario: (pacienteId: number) => api.get<CalendarioVacuna[]>(`/vacunas/paciente/${pacienteId}/calendario`),
  create: (data: Partial<Vacuna>) => api.post<Vacuna>('/vacunas', data),
  update: (id: number, data: Partial<Vacuna>) => api.put<Vacuna>(`/vacunas/${id}`, data),
  delete: (id: number) => api.delete(`/vacunas/${id}`),
  aplicar: (data: { pacienteId: number; vacunaId: number; dosisNumero?: number; fechaAplicacion: string; lote?: string; laboratorio?: string; lugarAplicacion?: string; proximaDosis?: string; observaciones?: string }) => api.post<PacienteVacuna>('/vacunas/aplicar', data),
  removeAplicacion: (id: number) => api.delete(`/vacunas/aplicacion/${id}`),
};
