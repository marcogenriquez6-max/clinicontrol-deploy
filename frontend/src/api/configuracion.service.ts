import api from './axios';
import type { ClinicaInfo } from '../types';

export const configuracionService = {
  getClinica: () => api.get<ClinicaInfo>('/configuracion/clinica'),
  updateClinica: (data: Partial<ClinicaInfo>) => api.put<ClinicaInfo>('/configuracion/clinica', data),
};

export interface RespaldoInfo { nombre: string; tamanoBytes: number; creadoEn: string }

export const respaldoService = {
  listar: () => api.get<RespaldoInfo[]>('/respaldos'),
  crear: () => api.post<RespaldoInfo>('/respaldos'),
  eliminar: (nombre: string) => api.delete(`/respaldos/${encodeURIComponent(nombre)}`),
  urlDescarga: (nombre: string) => `/respaldos/${encodeURIComponent(nombre)}/descargar`,
  descargar: (nombre: string) => api.get(`/respaldos/${encodeURIComponent(nombre)}/descargar`, { responseType: 'blob' }),
};

export interface PermisoRol { rol: string; descripcion: string; modulos: string[]; permisos: string[] }

export const permisosService = {
  getMatriz: () => api.get<PermisoRol[]>('/roles/permisos'),
};
