import { Injectable, NotFoundException } from '@nestjs/common';
import { InteraccionMedicamentoRepositoryPort } from '../domain/ports/interaccion-medicamento-repository.port';
import {
  CreateInteraccionDto,
  UpdateInteraccionDto,
  VerificarInteraccionesDto,
  VerificarInteraccionesPacienteDto,
} from '../infrastructure/dto/create-interaccion.dto';
import { Alergia } from '../../../entities/alergia.entity';
import { Paciente } from '../../../entities/paciente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class InteraccionMedicamentoService {
  constructor(
    private readonly interaccionRepo: InteraccionMedicamentoRepositoryPort,
    @InjectRepository(Alergia)
    private readonly alergiaRepository: Repository<Alergia>,
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
  ) {}

  async findAll() {
    return this.interaccionRepo.findAll();
  }

  async findOne(id: number) {
    const interaccion = await this.interaccionRepo.findById(id);
    if (!interaccion)
      throw new NotFoundException(`Interacción con ID ${id} no encontrada`);
    return interaccion;
  }

  async create(dto: CreateInteraccionDto) {
    return this.interaccionRepo.create(dto as any);
  }

  async update(id: number, dto: UpdateInteraccionDto) {
    await this.findOne(id);
    return this.interaccionRepo.update(id, dto as any);
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.interaccionRepo.delete(id);
  }

  async verificarInteracciones(medicamentoIds: number[]) {
    return this.interaccionRepo.verificarInteracciones(medicamentoIds);
  }

  async verificarInteraccionesConAlergias(
    pacienteId: number,
    medicamentoIds: number[],
  ) {
    const interacciones =
      await this.interaccionRepo.verificarInteracciones(medicamentoIds);

    const paciente = await this.pacienteRepository.findOne({
      where: { id: pacienteId },
      relations: ['alergias'],
    });
    if (!paciente)
      throw new NotFoundException(
        `Paciente con ID ${pacienteId} no encontrado`,
      );

    const alergias = paciente.alergias.map((a) => ({
      alergiaId: a.id,
      nombre: a.nombre,
      severidad: a.severidad,
      descripcion: a.descripcion,
    }));

    return { interacciones, alergias };
  }
}
