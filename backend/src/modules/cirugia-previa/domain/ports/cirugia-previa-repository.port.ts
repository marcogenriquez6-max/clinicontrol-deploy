import { CirugiaPreviaDomain } from '../cirugia-previa.domain';

export abstract class CirugiaPreviaRepositoryPort {
  abstract findAll(): Promise<CirugiaPreviaDomain[]>;
  abstract findById(id: number): Promise<CirugiaPreviaDomain | null>;
  abstract create(
    data: Partial<CirugiaPreviaDomain>,
  ): Promise<CirugiaPreviaDomain>;
  abstract update(
    id: number,
    data: Partial<CirugiaPreviaDomain>,
  ): Promise<CirugiaPreviaDomain>;
  abstract delete(id: number): Promise<void>;
  abstract findByPaciente(pacienteId: number): Promise<CirugiaPreviaDomain[]>;
}
