import api from './axios';
import type { Sucursal } from '../types';

export const sucursalAdminService = {
  getAll: () => api.get('/sucursales'),
  getById: (id: number) => api.get(`/sucursales/${id}`),
  create: (data: Omit<Sucursal, 'id'>) => api.post('/sucursales', data),
  update: (id: number, data: Partial<Sucursal>) => api.put(`/sucursales/${id}`, data),
  getEstadisticas: (id: number) => api.get(`/sucursales/${id}/estadisticas`),
  getPlanes: () => api.get('/sucursales/planes'),
};
