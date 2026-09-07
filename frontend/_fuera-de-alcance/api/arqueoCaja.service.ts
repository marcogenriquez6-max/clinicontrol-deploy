import api from './axios';
import type { Arqueo } from '../types';

export const arqueoCajaService = {
  getAll: () => api.get<Arqueo[]>('/arqueo'),
  getById: (id: number) => api.get<Arqueo>(`/arqueo/${id}`),
  crear: (data: { montoEsperado: number; montoReal: number; observaciones?: string; usuarioId?: number; cajaSessionId?: number }) =>
    api.post<Arqueo>('/arqueo', data),
};
