import { BaseEntity } from '../../../common/domain/base.entity';

export class UsuarioDomain extends BaseEntity {
  constructor(
    id?: number,
    public nombre?: string,
    public apellido?: string,
    public ci?: string,
    public email?: string,
    public password?: string,
    public rolId?: number,
    public bloqueado = false,
    public bloqueadoMotivo?: string,
    public intentosFallidos = 0,
    public ultimoLogin?: Date,
    public mfaSecret?: string,
    public mfaEnabled = false,
    public mfaMethod?: string,
  ) {
    super(id);
  }
}
