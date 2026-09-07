import { BaseEntity } from '../../../common/domain';

export interface DiagnosticoEntry {
  cie10Id?: number;
  codigoCie10?: string;
  descripcion: string;
  tipo: 'principal' | 'secundario' | 'complicacion' | 'cronico';
  esCronico: boolean;
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

  motivo: string;
  sintomas: string;
  enfermedadActual?: string;
  examenFisico?: string;

  signosVitales: SignosVitales;

  evaluacion?: string;
  planTratamiento?: string;
  indicaciones?: string;

  diagnosticos: DiagnosticoEntry[];
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
    this.esContinuacion = false;
  }

  agregarSignosVitales(signos: SignosVitales): void {
    this.signosVitales = { ...this.signosVitales, ...signos };
  }

  agregarDiagnostico(diagnostico: DiagnosticoEntry): void {
    this.diagnosticos.push(diagnostico);
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
