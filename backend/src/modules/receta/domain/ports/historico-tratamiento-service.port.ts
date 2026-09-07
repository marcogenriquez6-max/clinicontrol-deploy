export abstract class HistoricoTratamientoServicePort {
  abstract create(data: {
    pacienteId: number;
    medicamentoId: number;
    consultaId: number;
    recetaId: number;
    fechaInicio: string;
    dosis: string;
    frecuencia: string;
    estado: string;
    medicoId: number;
    observaciones?: string;
  }): Promise<void>;
}
