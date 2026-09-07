import api from './axios';

export const historicoTratamientoService = {
  getByPaciente: (pacienteId: number) => api.get(`/historico-tratamiento/paciente/${pacienteId}`),
  getActivos: (pacienteId: number) => api.get(`/historico-tratamiento/paciente/${pacienteId}/activos`),
  getTimeline: (pacienteId: number) => api.get(`/historico-tratamiento/paciente/${pacienteId}/timeline`),
  crear: (data: { pacienteId: number; diagnostico: string; tratamiento: string; medicamentos?: string; notas?: string }) =>
    api.post('/historico-tratamiento', data),
  cambiarEstado: (id: number, data: { estado: string; motivoCambio?: string }) =>
    api.put(`/historico-tratamiento/${id}/estado`, data),
};
