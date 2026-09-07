import api from './axios';
import type { TipoAtencion } from '../types';

export const tipoAtencionService = {
  getAll: () => api.get<TipoAtencion[]>('/tipos-atencion'),
  getById: (id: number) => api.get<TipoAtencion>(`/tipos-atencion/${id}`),
  create: (data: { nombre: string; monto: number }) => api.post<TipoAtencion>('/tipos-atencion', data),
  update: (id: number, data: Partial<TipoAtencion>) => api.put<TipoAtencion>(`/tipos-atencion/${id}`, data),
  remove: (id: number) => api.delete(`/tipos-atencion/${id}`),
};
