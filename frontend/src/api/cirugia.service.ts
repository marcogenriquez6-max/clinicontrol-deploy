import api from './axios';
import type { CirugiaPrevia } from '../types';

export const cirugiaService = {
  getByPaciente: (pacienteId: number) => api.get<CirugiaPrevia[]>(`/cirugias/paciente/${pacienteId}`),
  create: (data: Omit<CirugiaPrevia, 'id'>) => api.post('/cirugias', data),
  update: (id: number, data: Partial<CirugiaPrevia>) => api.put(`/cirugias/${id}`, data),
  delete: (id: number) => api.delete(`/cirugias/${id}`),
};
