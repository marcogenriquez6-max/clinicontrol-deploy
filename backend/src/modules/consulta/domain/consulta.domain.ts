import { BaseEntity } from '../../../common/domain';

export interface DiagnosticoEntry {
  cie10Id?: number;
  codigoCie10?: string;
  descripcion: string;
  tipo: 'principal' | 'secundario' | 'complicacion' | 'cronico';
  esCronico: boolean;
  cie10?: { id?: number; codigo?: string; descripcion?: string };
}

export interface RecetaEntry {
  id?: number;
  estado?: string;
  instrucciones?: string;
  createdAt?: Date;
  items: Array<{
    id?: number;
    medicamentoId: number;
    medicamentoNombre?: string;
    dosis?: string;
    frecuencia?: string;
    duracion?: string;
    observaciones?: string;
    cantidad?: number;
    cantidadDispensada?: number;
  }>;
}

export interface SignosVitales {
  presionArterialSistolica?: number;
  presionArterialDiastolica?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  temperatura?: number;
  saturacionOxigeno?: number;
  glucosaCapilar?: number;
  peso?: number;
  talla?: number;
}

export class ConsultaDomain extends BaseEntity {
  pacienteId: number;
  medicoId: number;
  citaId?: number;
  fecha: Date;
  tipoConsulta: string;

  medico?: {
    id?: number;
    nombre?: string;
    apellido?: string;
    especialidad?: string;
    especialidadId?: number;
  };

  motivo: string;
  sintomas: string;
  enfermedadActual?: string;
  examenFisico?: string;

  signosVitales: SignosVitales;

  evaluacion?: string;
  planTratamiento?: string;
  indicaciones?: string;

  diagnosticos: DiagnosticoEntry[];
  recetas: RecetaEntry[];
  esContinuacion: boolean;
  consultaOriginalId?: number;
  motivoContinuacion?: string;

  constructor(props: {
    id?: number;
    pacienteId: number;
    medicoId: number;
    citaId?: number;
    motivo: string;
    sintomas: string;
    fecha?: Date;
    tipoConsulta?: string;
  }) {
    super(props.id);
    this.pacienteId = props.pacienteId;
    this.medicoId = props.medicoId;
    this.citaId = props.citaId;
    this.motivo = props.motivo;
    this.sintomas = props.sintomas;
    this.fecha = props.fecha || new Date();
    this.tipoConsulta = props.tipoConsulta || 'consulta_general';
    this.signosVitales = {};
    this.diagnosticos = [];
    this.recetas = [];
    this.esContinuacion = false;
  }

  agregarSignosVitales(signos: SignosVitales): void {
    this.signosVitales = { ...this.signosVitales, ...signos };
  }

  agregarDiagnostico(diagnostico: DiagnosticoEntry): void {
    this.diagnosticos.push(diagnostico);
  }

  agregarReceta(receta: RecetaEntry): void {
    this.recetas.push(receta);
  }

  agregarEvaluacion(
    evaluacion: string,
    plan: string,
    indicaciones: string,
  ): void {
    this.evaluacion = evaluacion;
    this.planTratamiento = plan;
    this.indicaciones = indicaciones;
  }

  marcarComoContinuacion(consultaOriginalId: number, motivo: string): void {
    this.esContinuacion = true;
    this.consultaOriginalId = consultaOriginalId;
    this.motivoContinuacion = motivo;
  }

  get imc(): number | undefined {
    if (
      this.signosVitales.peso &&
      this.signosVitales.talla &&
      this.signosVitales.talla > 0
    ) {
      return (
        this.signosVitales.peso /
        (this.signosVitales.talla * this.signosVitales.talla)
      );
    }
    return undefined;
  }

  get resumenSOAP(): {
    subjetivo: string;
    objetivo: string;
    analisis: string;
    plan: string;
  } {
    return {
      subjetivo: `Motivo: ${this.motivo}\nSíntomas: ${this.sintomas}${this.enfermedadActual ? `\nEnfermedad actual: ${this.enfermedadActual}` : ''}`,
      objetivo: `Examen físico: ${this.examenFisico || 'No registrado'}\nSignos vitales: ${this.formatearSignosVitales()}`,
      analisis: this.evaluacion || 'Pendiente de evaluación',
      plan: this.planTratamiento || 'No registrado',
    };
  }

  private formatearSignosVitales(): string {
    const partes: string[] = [];
    if (
      this.signosVitales.presionArterialSistolica &&
      this.signosVitales.presionArterialDiastolica
    ) {
      partes.push(
        `PA: ${this.signosVitales.presionArterialSistolica}/${this.signosVitales.presionArterialDiastolica} mmHg`,
      );
    }
    if (this.signosVitales.frecuenciaCardiaca)
      partes.push(`FC: ${this.signosVitales.frecuenciaCardiaca} lpm`);
    if (this.signosVitales.temperatura)
      partes.push(`T: ${this.signosVitales.temperatura}°C`);
    if (this.signosVitales.saturacionOxigeno)
      partes.push(`SpO2: ${this.signosVitales.saturacionOxigeno}%`);
    return partes.join(', ') || 'No registrados';
  }
}
