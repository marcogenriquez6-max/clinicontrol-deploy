export interface CajaSession {
  id: number;
  fechaApertura: string;
  fechaCierre?: string;
  montoInicial: number;
  montoFinal?: number;
  estado: 'abierta' | 'cerrada';
  usuarioId: number;
  observaciones?: string;
  createdAt?: string;
}
