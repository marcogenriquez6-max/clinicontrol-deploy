export interface Cie10 {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface Diagnostico {
  id?: number;
  consultaId: number;
  cie10Id?: number;
  cie10?: Cie10;
  descripcion: string;
  tipo?: string;
  createdAt?: string;
}

export interface Consulta {
  id?: number;
  pacienteId: number;
  paciente?: import('./paciente.types').Paciente;
  medicoId: number;
  medico?: import('./medico.types').Medico;
  citaId?: number;
  motivo?: string;
  sintomas?: string;
  examenFisico?: string;
  observaciones?: string;
  createdAt?: string;
  diagnosticos?: Diagnostico[];
  recetas?: import('./receta.types').Receta[];
}

export interface ConsultaCompletaDto {
  pacienteId: number;
  medicoId: number;
  citaId?: number;
  motivoConsulta?: string;
  sintomas?: string;
  enfermedadActual?: string;
  examenFisico?: string;
  peso?: number;
  talla?: number;
  temperatura?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  presionArterialSistolica?: number;
  presionArterialDiastolica?: number;
  saturacionOxigeno?: number;
  glucosaCapilar?: number;
  evaluacion?: string;
  planTratamiento?: string;
  indicaciones?: string;
  diagnosticos: Array<{
    cie10Id?: number;
    descripcion: string;
    tipo: 'principal' | 'secundario' | 'complicacion' | 'cronico';
    esCronico?: boolean;
  }>;
  recetas?: Array<{
    medicamentoId: number;
    dosis: string;
    frecuencia: string;
    duracion?: string;
    cantidad: number;
    observaciones?: string;
  }>;
}
