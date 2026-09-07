export interface EstadoCita {
  id: number;
  nombre: string;
}

export interface Cita {
  id?: number;
  pacienteId: number;
  paciente?: import('./paciente.types').Paciente;
  medicoId: number;
  medico?: import('./medico.types').Medico;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  estadoId: number;
  estado?: EstadoCita;
  especialidadId?: number;
  especialidad?: import('./medico.types').Especialidad;
  servicioId?: number;
  servicio?: import('./servicio.types').Servicio;
  tipoAtencionId?: number;
  tipoAtencion?: import('./tipoAtencion.types').TipoAtencion;
  motivo?: string;
  sucursalId?: number;
  createdAt?: string;
}
