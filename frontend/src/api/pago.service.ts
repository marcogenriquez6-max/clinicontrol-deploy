import api from './axios';
import type { Pago, TurnoPendientePago, ReciboData } from '../types';

export interface PagoQuery {
  fechaInicio?: string;
  fechaFin?: string;
  pacienteId?: number;
  q?: string;
  estado?: string;
  page?: number;
  limit?: number;
}

export const pagoService = {
  getAll: (params?: PagoQuery) => api.get<Pago[]>('/pagos', { params }),
  getPendientes: (fecha?: string) =>
    api.get<TurnoPendientePago[]>('/pagos/pendientes', { params: fecha ? { fecha } : undefined }),
  getResumen: (fechaInicio?: string, fechaFin?: string) =>
    api.get<{ cantidad: number; total: number }>('/pagos/resumen', { params: { fechaInicio, fechaFin } }),
  getById: (id: number) => api.get<Pago>(`/pagos/${id}`),
  getRecibo: (id: number) => api.get<ReciboData>(`/pagos/${id}/recibo`),
  registrar: (data: { turnoId?: number; pacienteId?: number; concepto?: string; monto?: number; observaciones?: string }) =>
    api.post<Pago>('/pagos', data),
  anular: (id: number, motivo: string) => api.patch<Pago>(`/pagos/${id}/anular`, { motivo }),
};
