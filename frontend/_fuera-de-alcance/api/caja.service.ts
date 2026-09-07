import api from './axios';
import type { CajaSession } from '../types';

export const cajaService = {
  getAll: () => api.get<CajaSession[]>('/caja'),
  getActual: () => api.get<CajaSession | null>('/caja/actual'),
  getById: (id: number) => api.get<CajaSession>(`/caja/${id}`),
  abrirSesion: (montoInicial: number, usuarioId: number) =>
    api.post<CajaSession>('/caja/abrir', { montoInicial, usuarioId }),
  cerrarSesion: (id: number, montoFinal: number, observaciones?: string) =>
    api.put<CajaSession>(`/caja/${id}/cerrar`, { montoFinal, observaciones }),
  cobrar: (montoRecibido: number) => api.post<{ valido: boolean; vuelto: number; mensaje: string }>('/caja/cobrar', { montoRecibido }),
  arqueo: () => api.get<{ montoInicial: number; montoFinal: number; cobrosRealizados: number; vuelto: number; mensaje: string }>('/caja/arqueo'),
};
