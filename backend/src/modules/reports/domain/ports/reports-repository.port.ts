export interface PacienteReportData {
  id: number;
  nombre: string;
  apellido: string;
  ci?: string;
  fechaNacimiento?: Date;
  telefono?: string;
  email?: string;
  genero?: { nombre: string };
  grupoSanguineo?: { nombre: string };
  activo: boolean;
  createdAt: Date;
  consultas: ConsultaReportData[];
}

export interface ConsultaReportData {
  fecha?: Date;
  medico?: { nombre: string; apellido: string };
  medicoNombre?: string;
  motivo?: string;
  sintomas?: string;
  observaciones?: string;
  diagnosticos: DiagnosticoReportData[];
  recetas: RecetaReportData[];
}

export interface DiagnosticoReportData {
  cie10?: { codigo: string; descripcion: string };
}

export interface RecetaReportData {
  items: RecetaItemReportData[];
}

export interface RecetaItemReportData {
  medicamento?: { nombre: string };
  dosis?: string;
  frecuencia?: string;
}

export interface CitaReportData {
  paciente?: { nombre: string; apellido: string };
  medico?: {
    nombre: string;
    apellido: string;
    especialidad?: { nombre: string };
  };
  estado?: { nombre: string };
  fecha?: Date;
}

export interface EstadisticasData {
  totalPacientes: number;
  totalMedicos: number;
  totalCitas: number;
  totalConsultas: number;
  citasHoy: number;
  recetasActivas: number;
}

export interface DashboardData {
  totalPacientes: number;
  totalMedicos: number;
  totalCitas: number;
  totalConsultas: number;
  citasPendientes: number;
  turnosHoy: number;
  citasHoy: number;
  pacientesHoy: number;
  recetasActivas: number;
}

export interface TriajeESIData {
  nivel: number;
  nombre: string;
  total: number;
  porcentaje: number;
}

export interface TriajeESIReport {
  totalEvaluados: number;
  porNivel: TriajeESIData[];
  generadoEn: Date;
}

export interface HospitalizacionDomain {
  id: number;
  pacienteId: number;
  medicoTratanteId: number;
  camaId: number;
  fechaIngreso: Date;
  fechaAlta?: Date;
  motivoIngreso: string;
  diagnosticoIngreso?: string;
  observaciones?: string;
  estado: string;
  usuarioRegistroId: number;
  creadoEn: Date;
}

export interface IngresoEgresoData {
  estado: string;
  total: number;
  porcentaje: number;
}

export interface CamaOcupacionData {
  camaId: number;
  codigoCama: string;
  estado: string;
  ocupado: boolean;
}

export interface HospitalizacionReport {
  totalInternados: number;
  totalIngresos: number;
  totalEgresos: number;
  ocupacionActual: number;
  porEstado: IngresoEgresoData[];
  porCama: CamaOcupacionData[];
  generadoEn: Date;
}

export interface IndicadoresEstadisticasData {
  totalPacientes: number;
  totalMedicos: number;
  totalCitas: number;
  totalConsultas: number;
  totalEgresosHospitalizacion: number;
  triajesRealizados: number;
  pacientesNuevos: number;
  pacientesRecurrentes: number;
  consultasPorMedico: Record<string, number>;
  diagnosticosTop: { codigo: string; descripcion: string }[];
  productividadMedica: Record<string, { nombre: string; consultas: number }>;
  triajesPorNivel: TriajeESIData[];
  generadoEn: Date;
}

export abstract class ReportsRepositoryPort {
  abstract findPacienteConHistorial(
    pacienteId: number,
  ): Promise<PacienteReportData | null>;

  abstract findCitas(
    fechaInicio?: string,
    fechaFin?: string,
    medicoId?: number,
    estadoId?: number,
  ): Promise<CitaReportData[]>;

  abstract getEstadisticas(): Promise<EstadisticasData>;

  abstract findAllPacientes(): Promise<PacienteReportData[]>;

  abstract getDashboard(): Promise<DashboardData>;

  abstract getTriajeESI(
    fechaInicio?: string,
    fechaFin?: string,
    realizadoPorId?: number,
  ): Promise<TriajeESIReport>;

  abstract getHospitalizacion(
    fechaInicio?: string,
    fechaFin?: string,
    medicoId?: number,
  ): Promise<HospitalizacionReport>;

  abstract getIndicadoresEstadisticas(
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<IndicadoresEstadisticasData>;
}