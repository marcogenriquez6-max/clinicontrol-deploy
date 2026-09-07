import { Injectable, NotFoundException } from '@nestjs/common';
import {
  VacunaRepositoryPort,
  PacienteVacunaRow,
} from '../domain/ports/vacuna-repository.port';
import { VacunaDomain } from '../domain/vacuna.domain';
import {
  CreateVacunaDto,
  UpdateVacunaDto,
  AplicarVacunaDto,
} from '../infrastructure/dto/create-vacuna.dto';

@Injectable()
export class VacunaService {
  constructor(private readonly vacunaRepo: VacunaRepositoryPort) {}

  async getAll(): Promise<VacunaDomain[]> {
    return this.vacunaRepo.findActivos();
  }

  async findOne(id: number): Promise<VacunaDomain> {
    const entity = await this.vacunaRepo.findById(id);
    if (!entity)
      throw new NotFoundException(`Vacuna con ID ${id} no encontrada`);
    return entity;
  }

  async search(query: string): Promise<VacunaDomain[]> {
    return this.vacunaRepo.search(query);
  }

  async create(dto: CreateVacunaDto): Promise<VacunaDomain> {
    return this.vacunaRepo.create(dto as any);
  }

  async update(id: number, dto: UpdateVacunaDto): Promise<VacunaDomain> {
    await this.findOne(id);
    return this.vacunaRepo.update(id, dto as any);
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.vacunaRepo.delete(id);
  }

  async getAplicacionesByPacienteId(
    pacienteId: number,
  ): Promise<PacienteVacunaRow[]> {
    return this.vacunaRepo.findAplicacionesByPacienteId(pacienteId);
  }

  async getCalendarioByPacienteId(pacienteId: number): Promise<
    {
      vacuna: VacunaDomain;
      dosisAplicadas: number;
      dosisPendientes: number;
      ultimaAplicacion: { fecha: string; dosis: number; lote?: string } | null;
      estado:
        | 'completa'
        | 'incompleta'
        | 'pendiente'
        | 'atrasada'
        | 'no_corresponde';
      esquemaCompleto: boolean;
    }[]
  > {
    const todasLasVacunas = await this.vacunaRepo.findActivos();
    const aplicaciones =
      await this.vacunaRepo.findAplicacionesByPacienteId(pacienteId);

    return todasLasVacunas.map((vacuna) => {
      const vacunasAplicadas = aplicaciones.filter(
        (a) => a.vacunaId === vacuna.id,
      );
      const dosisAplicadas = vacunasAplicadas.length;
      const dosisReq = vacuna.dosisRecomendadas ?? 1;
      const dosisPendientes = Math.max(0, dosisReq - dosisAplicadas);

      let ultimaAplicacion: {
        fecha: string;
        dosis: number;
        lote?: string;
      } | null = null;
      if (vacunasAplicadas.length > 0) {
        const ultima = vacunasAplicadas.sort(
          (a, b) =>
            new Date(b.fechaAplicacion).getTime() -
            new Date(a.fechaAplicacion).getTime(),
        )[0];
        ultimaAplicacion = {
          fecha: ultima.fechaAplicacion,
          dosis: ultima.dosisNumero,
          lote: ultima.lote ?? undefined,
        };
      }

      let estado:
        | 'completa'
        | 'incompleta'
        | 'pendiente'
        | 'atrasada'
        | 'no_corresponde' = 'pendiente';
      if (vacunasAplicadas.length === 0) {
        if (vacuna.esObligatoria) {
          const edadMeses = 0;
          if (vacuna.edadMinimaMeses && edadMeses >= vacuna.edadMinimaMeses) {
            estado = 'atrasada';
          } else {
            estado = 'pendiente';
          }
        } else {
          estado = 'no_corresponde';
        }
      } else if (dosisPendientes === 0) {
        estado = 'completa';
      } else {
        estado = 'incompleta';
      }

      return {
        vacuna,
        dosisAplicadas,
        dosisPendientes,
        ultimaAplicacion,
        estado,
        esquemaCompleto: dosisPendientes === 0,
      };
    });
  }

  async aplicarVacuna(dto: AplicarVacunaDto): Promise<PacienteVacunaRow> {
    await this.findOne(dto.vacunaId);
    return this.vacunaRepo.createAplicacion({
      pacienteId: dto.pacienteId,
      vacunaId: dto.vacunaId,
      dosisNumero: dto.dosisNumero,
      fechaAplicacion: dto.fechaAplicacion,
      lote: dto.lote,
      laboratorio: dto.laboratorio,
      lugarAplicacion: dto.lugarAplicacion,
      aplicadoPorId: dto.aplicadoPorId,
      proximaDosis: dto.proximaDosis,
      observaciones: dto.observaciones,
    });
  }

  async removeAplicacion(id: number): Promise<void> {
    await this.vacunaRepo.deleteAplicacion(id);
  }
}
