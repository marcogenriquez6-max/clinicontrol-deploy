export interface Arqueo {
  id: number;
  fecha: string;
  montoEsperado: number;
  montoReal: number;
  diferencia: number;
  observaciones?: string;
  usuarioId?: number;
  cajaSessionId?: number;
  createdAt?: string;
}
