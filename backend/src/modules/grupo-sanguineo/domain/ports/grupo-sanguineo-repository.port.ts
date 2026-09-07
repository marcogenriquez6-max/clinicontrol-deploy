import { GrupoSanguineoDomain } from '../grupo-sanguineo.domain';

export abstract class GrupoSanguineoRepositoryPort {
  abstract findAll(): Promise<GrupoSanguineoDomain[]>;
  abstract findById(id: number): Promise<GrupoSanguineoDomain | null>;
  abstract create(
    data: Partial<GrupoSanguineoDomain>,
  ): Promise<GrupoSanguineoDomain>;
  abstract update(
    id: number,
    data: Partial<GrupoSanguineoDomain>,
  ): Promise<GrupoSanguineoDomain>;
  abstract delete(id: number): Promise<void>;
}
