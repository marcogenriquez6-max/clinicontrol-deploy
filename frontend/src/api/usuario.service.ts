import api from './axios';
import type { Usuario, Rol } from '../types';

export const usuarioService = {
  getAll: () => api.get<Usuario[]>('/usuarios'),
  getById: (id: number) => api.get<Usuario>(`/usuarios/${id}`),
  create: (data: Partial<Usuario>) => api.post<Usuario>('/usuarios', data),
  update: (id: number, data: Partial<Usuario>) => api.put<Usuario>(`/usuarios/${id}`, data),
  delete: (id: number) => api.delete(`/usuarios/${id}`),
};

export const rolService = {
  getAll: () => api.get<Rol[]>('/roles'),
  getById: (id: number) => api.get<Rol>(`/roles/${id}`),
};
