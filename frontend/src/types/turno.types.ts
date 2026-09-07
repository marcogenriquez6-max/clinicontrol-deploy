export interface Turno {
  id: number;
  numero: number;
  prefijo?: string;
  pacienteNombre: string;
  pacienteApellido?: string;
  pacienteCI: string;
  pacienteTel?: string;
  medicoNombre: string;
  especialidad: string;
  consultorio: string;
  estado: 'espera' | 'llamado' | 'atencion' | 'completado' | 'cancelado' | 'no_asistio';
  tipo: string | number;
  creadoEn: string;
  pagado: boolean;
  monto: number;
  fechaProgramada?: string;
  horaProgramada?: string;
  pacienteId: number;
  medicoId: number;
  citaId?: number;
  esUrgencia?: boolean;
  pagadoEn?: string;
}

export interface TipoAtencion {
  id: number;
  nombre: string;
  tipo?: 'consulta_nueva' | 'reconsulta';
  monto: number;
  duracionMinutos?: number;
  activo?: boolean;
}
