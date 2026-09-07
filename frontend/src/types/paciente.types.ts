export interface Genero {
  id: number;
  nombre: string;
}

export interface GrupoSanguineo {
  id: number;
  nombre: string;
}

export type EstadoPaciente = 'activo' | 'inactivo' | 'suspendido' | 'fallecido' | 'archivado';

export interface Paciente {
  id?: number;
  nombre: string;
  apellido: string;
  ci: string;
  fechaNacimiento: string;
  generoId: number;
  genero?: Genero;
  telefono?: string;
  direccion?: string;
  email?: string;
  grupoSanguineoId?: number;
  grupoSanguineo?: GrupoSanguineo;
  estado?: EstadoPaciente;
  especialidad?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  createdAt?: string;
  consultas?: import('./consulta.types').Consulta[];
}

export interface PerfilPaciente {
  id: number;
  nombreCompleto: string;
  ci: string;
  fechaNacimiento: string;
  edad: number;
  genero?: string;
  grupoSanguineo?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  alergias?: string;
  totalConsultas: number;
  totalRecetas: number;
  citasPendientes: number;
  ultimaConsulta?: string;
  registradoDesde: string;
}

export interface HistoriaClinicaItem {
  pacienteId: number;
  pacienteNombre: string;
  ci: string;
  consultaId: number;
  consultaFecha: string;
  medicoNombre: string;
  especialidad: string;
  motivoConsulta?: string;
  sintomas?: string;
  examenFisico?: string;
  temperatura?: number;
  frecuenciaCardiaca?: number;
  presionArterial?: string;
  peso?: number;
  talla?: number;
  imc?: number;
  planTratamiento?: string;
  indicaciones?: string;
  diagnosticos?: string;
  cie10Codes?: string;
  totalRecetas?: number;
}
