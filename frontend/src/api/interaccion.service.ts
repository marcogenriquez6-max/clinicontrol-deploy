import api from './axios';
import type { InteraccionMedicamento } from '../types';

export const interaccionService = {
  verificar: (medicamentoIds: number[]) => api.post<InteraccionMedicamento[]>('/interacciones/verificar', { medicamentoIds }),
  verificarConPaciente: (pacienteId: number, medicamentoIds: number[]) => api.post('/interacciones/verificar/paciente', { pacienteId, medicamentoIds }),
};

export const seguridadMedicaService = {
  verificarDuplicidad: (pacienteId: number, medicamentoIds: number[]) =>
    api.post('/recetas/verificar-duplicidad', { pacienteId, medicamentoIds }),
};
