import api from './axios';
import type { Cie10 } from '../types';

export const diagnosticoService = {
  searchCie10: (query: string) => api.get<Cie10[]>('/diagnosticos/cie10', { params: { q: query } }),
  getAll: () => api.get('/diagnosticos'),
};
