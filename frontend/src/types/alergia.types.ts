export interface TipoAlergia {
  id: number;
  nombre: string;
  severidadBase: string;
}

export interface Alergia {
  id: number;
  nombre: string;
  descripcion?: string;
  severidad: 'leve' | 'moderada' | 'severa' | 'anafilactica';
  tipoAlergiaId?: number;
  tipoAlergia?: TipoAlergia;
}

export interface InteraccionMedicamento {
  id: number;
  medicamentoId1: number;
  medicamentoId2: number;
  severidad: 'leve' | 'moderada' | 'severa' | 'contraindicada';
  descripcion: string;
  efecto?: string;
  recomendacion?: string;
}

export interface AlertaDuplicidad {
  tipo: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  mensaje: string;
  medicamento1: string;
  medicamento2: string;
}

export interface AlertaContraindicacion {
  medicamento: string;
  condicion: string;
  severidad: string;
  descripcion: string;
}

export interface ResultadoVerificacion {
  duplicidad: AlertaDuplicidad[];
  contraindicaciones: AlertaContraindicacion[];
  alergias: Alergia[];
  interacciones: InteraccionMedicamento[];
}
