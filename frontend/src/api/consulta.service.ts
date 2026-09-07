import api from './axios';
import type { Consulta, ConsultaCompletaDto } from '../types';

export const consultaService = {
  getAll: () => api.get<Consulta[]>('/consultas'),
  getById: (id: number) => api.get<Consulta>(`/consultas/${id}`),
  getByPaciente: (id: number) => api.get<Consulta[]>('/consultas', { params: { pacienteId: id } }),
  getByMedico: (id: number) => api.get<Consulta[]>(`/consultas/medico/${id}`),
  create: (data: Partial<Consulta>) => api.post<Consulta>('/consultas', data),
  update: (id: number, data: Partial<Consulta>) => api.put<Consulta>(`/consultas/${id}`, data),
  delete: (id: number) => api.delete(`/consultas/${id}`),
};

export const consultaCompletaService = {
  createCompleta: (data: ConsultaCompletaDto) => api.post('/consultas/completa', data),
  getHistorial: (pacienteId: number) => api.get<Consulta[]>(`/consultas/paciente/${pacienteId}/historial`),
  continuar: (consultaId: number, data: Omit<ConsultaCompletaDto, 'pacienteId' | 'medicoId'>) => api.post(`/consultas/${consultaId}/continuar`, data),
  crearEnmienda: (consultaId: number, data: ConsultaCompletaDto) => api.put(`/consultas/${consultaId}`, data),
  crearNotaEnmienda: (consultaId: number, contenido: string) =>
    api.post(`/consultas/${consultaId}/nota`, { contenido }),
};
