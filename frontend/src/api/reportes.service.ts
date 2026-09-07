import api from './axios';

export interface Periodo { fechaInicio?: string; fechaFin?: string }

const q = (p?: Periodo, extra?: Record<string, unknown>) => ({ params: { ...(p ?? {}), ...(extra ?? {}) } });

/** Reportes por rol (JSON). La impresión se resuelve en el navegador. */
export const reportesService = {
  recepcion: (p?: Periodo) => api.get('/reports/recepcion', q(p)),
  triaje: (p?: Periodo) => api.get('/reports/triaje', q(p)),
  medico: (p?: Periodo, medicoId?: number) => api.get('/reports/medico', q(p, medicoId ? { medicoId } : undefined)),
  hospitalizacion: (p?: Periodo) => api.get('/reports/hospitalizacion', q(p)),
  indicadores: () => api.get('/reports/indicadores'),
  estadisticas: (p?: Periodo) => api.get('/reports/estadisticas-periodo', q(p)),
  pacientes: (p?: Periodo) => api.get('/reports/pacientes', q(p)),
  citas: (p?: Periodo) => api.get('/reports/citas/resumen', q(p)),
  productividad: (p?: Periodo) => api.get('/reports/productividad', q(p)),
  auditoria: (p?: Periodo, tipo: 'general' | 'usuario' | 'accesos' = 'general', userId?: string) =>
    api.get('/reports/auditoria', q(p, { tipo, userId })),
  registrarImpresion: (reporte: string, detalle?: string) =>
    api.post('/reports/impresion', { reporte, detalle }),
};
