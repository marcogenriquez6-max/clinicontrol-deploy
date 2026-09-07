import api from './axios';
import type { Receta, Medicamento } from '../types';

export const recetaService = {
  getAll: () => api.get<Receta[]>('/recetas'),
  getById: (id: number) => api.get<Receta>(`/recetas/${id}`),
  getByConsulta: (id: number) => api.get<Receta[]>(`/recetas/consulta/${id}`),
  searchMedicamentos: (query: string) => api.get<Medicamento[]>('/recetas/medicamentos', { params: { q: query } }),
  create: (data: Omit<Receta, 'id'>) => api.post<Receta>('/recetas', data),
  update: (id: number, data: Partial<Receta>) => api.put<Receta>(`/recetas/${id}`, data),
  delete: (id: number) => api.delete(`/recetas/${id}`),
  verificarSeguridadCompleta: (pacienteId: number, medicamentoIds: number[]) =>
    api.post<{ alergias: any[]; duplicidad: any[]; duplicidadTerapeutica: any[]; interacciones: any[]; total: any[] }>(
      `/recetas/verificar-seguridad-al-completa`,
      { pacienteId, medicamentoIds },
    ),
};
