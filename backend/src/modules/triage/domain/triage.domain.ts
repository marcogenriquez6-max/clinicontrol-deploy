import { BaseEntity } from '../../../common/domain/base.entity';

export enum ESILevel {
  UNO = 1,
  DOS = 2,
  TRES = 3,
  CUATRO = 4,
  CINCO = 5,
}

export enum TriageEstado {
  ACTIVO = 'activo',
  EN_ESPERA = 'en_espera',
  EN_ATENCION = 'en_atencion',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

export class TriageDomain extends BaseEntity {
  constructor(
    id?: number,
    public pacienteId?: number,
    public realizadoPorId?: number,
    public fechaHora?: Date,
    public fechaAtencion?: Date,
    public activo = true,
    public estado: string = TriageEstado.ACTIVO,
    public esiNivel: ESILevel = ESILevel.TRES,
    public temperatura?: number,
    public frecuenciaCardiaca?: number,
    public presionArterial?: string,
    public frecuenciaRespiratoria?: number,
    public saturacionOxigeno?: number,
    public peso?: number,
    public talla?: number,
    public glucosa?: number,
    public motivoConsulta?: string,
    public enfermedadActual?: string,
    public alergias?: string,
  ) {
    super(id);
  }
}
