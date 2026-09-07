export interface Vacuna {
  id: number;
  nombre: string;
  descripcion?: string;
  dosisRecomendadas: number;
  edadMinimaMeses?: number;
  edadMaximaMeses?: number;
  intervalodias?: number;
  esObligatoria: boolean;
  activo: boolean;
  createdAt?: string;
}

export interface PacienteVacuna {
  id: number;
  pacienteId: number;
  vacunaId: number;
  vacuna?: Vacuna;
  dosisNumero: number;
  fechaAplicacion: string;
  lote?: string;
  laboratorio?: string;
  lugarAplicacion?: string;
  aplicadoPorId?: number;
  proximaDosis?: string;
  observaciones?: string;
  createdAt?: string;
}

export interface CalendarioVacuna {
  vacuna: Vacuna;
  dosisAplicadas: number;
  dosisPendientes: number;
  ultimaAplicacion: { fecha: string; dosis: number; lote?: string } | null;
  estado: 'completa' | 'incompleta' | 'pendiente' | 'atrasada' | 'no_corresponde';
  esquemaCompleto: boolean;
}
