import { BaseEntity } from '../../../common/domain/base.entity';

export enum BedStatus {
  DISPONIBLE = 'disponible',
  OCUPADO = 'ocupado',
  RESERVADO = 'reservado',
  LIMPIEZA = 'limpieza',
  MANTENIMIENTO = 'mantenimiento',
}

export enum AdmisionEstado {
  ADMITIDO = 'admitido',
  EN_OBSERVACION = 'en_observacion',
  INTERNADO = 'internado',
  ALTA = 'alta',
  TRASLADO = 'traslado',
  FALLECIDO = 'fallecido',
}

export class CamaDomain extends BaseEntity {
  constructor(
    id?: number,
    public codigoCama?: string,
    public servicio?: string,
    public piso?: string,
    public habitacion?: string,
    public estado: BedStatus = BedStatus.DISPONIBLE,
    public activo = true,
  ) {
    super(id);
  }
}

export class HospitalizacionDomain extends BaseEntity {
  constructor(
    id?: number,
    public pacienteId?: number,
    public medicoTratanteId?: number,
    public camaId?: number,
    public fechaIngreso?: Date,
    public fechaAlta?: Date,
    public motivoIngreso?: string,
    public diagnosticoIngreso?: string,
    public observaciones?: string,
    public estado: AdmisionEstado = AdmisionEstado.ADMITIDO,
    public usuarioRegistroId?: number,
    public notasAlta?: string,
    public diagnosticoAlta?: string,
    public activo = true,
  ) {
    super(id);
  }
}

export class NotaEvolucionDomain {
  constructor(
    id?: number,
    public hospitalizacionId?: number,
    public fecha?: Date,
    public nota?: string,
    public plan?: string,
    public indicaciones?: string,
    public realizadoPorId?: number,
    public activo = true,
  ) {}
}
