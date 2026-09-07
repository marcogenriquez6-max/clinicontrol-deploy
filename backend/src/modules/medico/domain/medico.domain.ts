import { BaseEntity } from '../../../common/domain/base.entity';

export class MedicoDomain extends BaseEntity {
  constructor(
    id?: number,
    public nombre?: string,
    public apellido?: string,
    public especialidades: number[] = [],
    public telefono?: string,
    public email?: string,
    public usuarioId?: number,
    public codigoMedico?: string,
    public sucursalId?: number,
    public consultorio?: string,
    public activo = true,
  ) {
    super(id);
  }
}
