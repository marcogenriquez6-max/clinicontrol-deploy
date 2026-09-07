export interface PlanSuscripcion {
  id: number;
  nombre: string;
  codigo: string;
  precioMensual: number;
  maxSucursales: number;
  maxMedicos: number;
  maxPacientes: number;
  incluyeLaboratorio: boolean;
  incluyeFarmacia: boolean;
  incluyeHospitalizacion: boolean;
  incluyeFacturacion: boolean;
}

export interface Sucursal {
  id?: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  rnc?: string;
  activo?: boolean;
  planSuscripcionId?: number;
  planSuscripcion?: PlanSuscripcion;
  fechaActivacion?: string;
  fechaExpiracion?: string;
  createdAt?: string;
}
