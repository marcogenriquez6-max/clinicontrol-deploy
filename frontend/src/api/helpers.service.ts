import api from './axios';
import type { Genero, GrupoSanguineo, EstadoCita } from '../types';

export const helpersService = {
  getGeneros: () => api.get<Genero[]>('/generos'),
  getGruposSanguineos: () => api.get<GrupoSanguineo[]>('/grupos-sanguineos'),
  getEstadosCita: () => api.get<EstadoCita[]>('/estados-cita'),
  getRoles: () => api.get('/roles'),
};
