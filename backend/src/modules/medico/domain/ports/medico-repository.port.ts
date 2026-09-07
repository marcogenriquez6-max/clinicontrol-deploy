import { MedicoDomain } from '../medico.domain';

export abstract class MedicoRepositoryPort {
  abstract findAll(): Promise<MedicoDomain[]>;
  abstract findById(id: number): Promise<MedicoDomain | null>;
  abstract findByEspecialidad(especialidadId: number): Promise<MedicoDomain[]>;
  abstract findByUsuarioId(usuarioId: number): Promise<MedicoDomain | null>;
  abstract create(data: Partial<MedicoDomain>): Promise<MedicoDomain>;
  abstract update(
    id: number,
    data: Partial<MedicoDomain>,
  ): Promise<MedicoDomain>;
  abstract delete(id: number): Promise<void>;
}
