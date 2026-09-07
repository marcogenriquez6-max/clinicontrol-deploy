export interface CirugiaPrevia {
  id?: number;
  pacienteId: number;
  nombreProcedimiento: string;
  fechaCirugia?: string;
  hospital?: string;
  medicoCirujano?: string;
  tipoAnestesia?: string;
  complicaciones?: string;
  observaciones?: string;
  createdAt?: string;
}
