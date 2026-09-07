import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TriageRepositoryPort } from '../domain/ports/triage-repository.port';
import { TriageDomain } from '../domain/triage.domain';
import {
  CreateTriageDto,
  UpdateTriageDto,
  TriageQueryDto,
} from '../infrastructure/dto/create-triage.dto';
import { MedicalValidator } from '../../../common/validators/medical.validator';

@Injectable()
export class TriageService {
  constructor(private readonly triageRepo: TriageRepositoryPort) {}

  async create(dto: CreateTriageDto, usuarioId: number): Promise<TriageDomain> {
    this.validateVitals(dto);

    if (
      !MedicalValidator.calculateESIVerified(dto.esiNivel, {
        temperatura: dto.temperatura,
        frecuenciaCardiaca: dto.frecuenciaCardiaca,
        presionSistolica: dto.presionSistolica,
        presionDiastolica: dto.presionDiastolica,
        frecuenciaRespiratoria: dto.frecuenciaRespiratoria,
        spo2: dto.spo2,
      })
    ) {
      throw new BadRequestException(
        'El nivel ESI no es consistente con los signos vitales',
      );
    }

    return this.triageRepo.create(dto as any, usuarioId);
  }

  async findAll(query: TriageQueryDto) {
    return this.triageRepo.findAll(query);
  }

  async findOne(id: number): Promise<TriageDomain> {
    const triage = await this.triageRepo.findById(id);
    if (!triage)
      throw new NotFoundException(`Triage con ID ${id} no encontrado`);
    return triage;
  }

  async findByPaciente(pacienteId: number) {
    return this.triageRepo.findByPaciente(pacienteId);
  }

  async findActivos() {
    return this.triageRepo.findActivos();
  }

  async update(id: number, dto: UpdateTriageDto): Promise<TriageDomain> {
    await this.findOne(id);
    return this.triageRepo.update(id, dto as any);
  }

  async cambiarEstado(id: number, nuevoEstado: string): Promise<TriageDomain> {
    const triage = await this.findOne(id);

    const transicionesValidas: Record<string, string[]> = {
      activo: ['en_espera', 'en_atencion', 'cancelado'],
      en_espera: ['en_atencion', 'cancelado'],
      en_atencion: ['completado', 'cancelado'],
      completado: [],
      cancelado: [],
    };

    const permitidos = transicionesValidas[triage.estado] || [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new BadRequestException(
        `Transición de estado inválida: "${triage.estado}" -> "${nuevoEstado}"`,
      );
    }

    return this.triageRepo.update(id, { estado: nuevoEstado } as any);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.triageRepo.softDelete(id);
    return { message: 'Registro de triage eliminado exitosamente' };
  }

  private validateVitals(dto: CreateTriageDto): void {
    const errors: string[] = [];

    if (
      dto.temperatura !== undefined &&
      !MedicalValidator.isValidTemperature(dto.temperatura)
    ) {
      errors.push(`Temperatura ${dto.temperatura}°C fuera de rango (34-42)`);
    }
    if (
      dto.frecuenciaCardiaca !== undefined &&
      !MedicalValidator.isValidHeartRate(dto.frecuenciaCardiaca)
    ) {
      errors.push(
        `Frecuencia cardíaca ${dto.frecuenciaCardiaca} fuera de rango (20-280)`,
      );
    }
    if (
      dto.presionSistolica !== undefined &&
      dto.presionDiastolica !== undefined
    ) {
      if (
        !MedicalValidator.isValidBloodPressure(
          dto.presionSistolica,
          dto.presionDiastolica,
        )
      ) {
        errors.push(
          `Presión arterial ${dto.presionSistolica}/${dto.presionDiastolica} fuera de rango`,
        );
      }
    }
    if (dto.spo2 !== undefined && !MedicalValidator.isValidSpO2(dto.spo2)) {
      errors.push(`SpO2 ${dto.spo2}% fuera de rango (50-100)`);
    }
    if (
      dto.glasgow !== undefined &&
      !MedicalValidator.isValidGlasgow(dto.glasgow)
    ) {
      errors.push(`Glasgow ${dto.glasgow} fuera de rango (3-15)`);
    }

    if (errors.length > 0) throw new BadRequestException(errors);
  }
}
