export type TipoAtencionTipo = 'consulta_nueva' | 'reconsulta';

export interface TipoAtencion {
  id: number;
  nombre: string;
  tipo: TipoAtencionTipo;
  duracionMinutos: number;
  monto: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}