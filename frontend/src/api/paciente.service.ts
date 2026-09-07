import api from './axios';
import type { Paciente, PerfilPaciente, Alergia, Diagnostico } from '../types';

export const pacienteService = {
  getAll: () => api.get<Paciente[]>('/pacientes'),
  getById: (id: number) => api.get<Paciente>(`/pacientes/${id}`),
  getByCi: (ci: string) => api.get<Paciente>(`/pacientes/ci/${ci}`),
  getHistoriaClinica: (id: number) => api.get<any>(`/pacientes/${id}/historia-clinica`),
  create: (data: Partial<Paciente>) => api.post<Paciente>('/pacientes', data),
  update: (id: number, data: Partial<Paciente>) => api.put<Paciente>(`/pacientes/${id}`, data),
  delete: (id: number) => api.delete(`/pacientes/${id}`),
};

export const pacienteExtraService = {
  getPerfil: (id: number) => api.get<PerfilPaciente>(`/pacientes/${id}/perfil`),
  buscar: (q: string) => api.get<Paciente[]>(`/pacientes/buscar?q=${q}`),
  getAlergias: (id: number) => api.get<Alergia[]>(`/pacientes/${id}/alergias`),
  addAlergia: (pacienteId: number, alergiaId: number, severidad?: string) => api.post(`/pacientes/${pacienteId}/alergias`, { alergiaId, severidad }),
  removeAlergia: (pacienteId: number, alergiaId: number) => api.delete(`/pacientes/${pacienteId}/alergias/${alergiaId}`),
  getDiagnosticosCronicos: (id: number) => api.get<Diagnostico[]>(`/pacientes/${id}/diagnosticos-cronicos`),
};
