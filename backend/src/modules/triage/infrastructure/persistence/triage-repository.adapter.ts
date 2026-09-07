import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TriageRepositoryPort,
  TriageQuery,
  PaginationMeta,
} from '../../domain/ports/triage-repository.port';
import { TriageDomain, TriageEstado } from '../../domain/triage.domain';
import { Triage } from '../../../../entities/triage.entity';
import { MedicalValidator } from '../../../../common/validators/medical.validator';

@Injectable()
export class TriageRepositoryAdapter implements TriageRepositoryPort {
  constructor(
    @InjectRepository(Triage)
    private readonly repo: Repository<Triage>,
  ) {}

  private toDomain(orm: Triage): TriageDomain {
    return new TriageDomain(
      orm.id,
      orm.pacienteId,
      orm.realizadoPorId,
      orm.fechaHora,
      orm.fechaAtencion,
      orm.activo,
      orm.estado,
      orm.esiNivel,
      orm.temperatura ? Number(orm.temperatura) : undefined,
      orm.frecuenciaCardiaca,
      orm.presionArterial,
      orm.frecuenciaRespiratoria,
      orm.saturacionOxigeno ? Number(orm.saturacionOxigeno) : undefined,
      orm.peso ? Number(orm.peso) : undefined,
      orm.talla ? Number(orm.talla) : undefined,
      orm.glucosa ? Number(orm.glucosa) : undefined,
      orm.motivoConsulta,
      orm.enfermedadActual,
      orm.alergias,
    );
  }

  async create(
    data: Partial<TriageDomain>,
    usuarioId: number,
  ): Promise<TriageDomain> {
    // El DTO trae presión sistólica/diastólica, spo2 y observaciones; la
    // entidad guarda presionArterial ("120/80"), saturacionOxigeno y
    // enfermedadActual. Sin este mapeo esos valores se perdían.
    const d = data as Record<string, unknown>;
    const {
      presionSistolica,
      presionDiastolica,
      spo2,
      observaciones,
      medicamentosActuales,
      glasgow,
      ...resto
    } = d;
    const presionArterial =
      d.presionArterial ??
      (presionSistolica != null && presionDiastolica != null
        ? `${presionSistolica}/${presionDiastolica}`
        : undefined);
    const notas = [
      observaciones ? String(observaciones) : '',
      medicamentosActuales ? `Medicación actual: ${String(medicamentosActuales)}` : '',
      glasgow != null ? `Glasgow: ${String(glasgow)}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    const triage = this.repo.create({
      ...resto,
      presionArterial,
      saturacionOxigeno: d.saturacionOxigeno ?? spo2,
      enfermedadActual: d.enfermedadActual ?? (notas || undefined),
      realizadoPorId: usuarioId,
      fechaHora: new Date(),
      estado: TriageEstado.ACTIVO,
    } as any);

    const saved = await this.repo.save(triage);
    return this.toDomain(saved as any);
  }

  async findAll(
    query: TriageQuery,
  ): Promise<{ data: TriageDomain[]; meta: PaginationMeta }> {
    const { estado, pacienteId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { activo: true };

    if (estado) where.estado = estado;
    if (pacienteId) where.pacienteId = pacienteId;

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['paciente', 'realizadoPor'],
      skip,
      take: limit,
      order: { esiNivel: 'ASC', fechaHora: 'ASC' },
    });

    return {
      data: data.map((o) => this.toDomain(o)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number): Promise<TriageDomain | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'realizadoPor', 'atendidoPor'],
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByPaciente(pacienteId: number): Promise<TriageDomain[]> {
    const orms = await this.repo.find({
      where: { pacienteId, activo: true },
      relations: ['realizadoPor'],
      order: { fechaHora: 'DESC' },
    });
    return orms.map((o) => this.toDomain(o));
  }

  async findActivos(): Promise<TriageDomain[]> {
    const orms = await this.repo.find({
      where: [
        { estado: TriageEstado.ACTIVO },
        { estado: TriageEstado.EN_ESPERA },
        { estado: TriageEstado.EN_ATENCION },
      ],
      relations: ['paciente', 'realizadoPor'],
      order: { esiNivel: 'ASC', fechaHora: 'ASC' },
    });
    return orms.map((o) => this.toDomain(o));
  }

  async update(id: number, data: Partial<TriageDomain>): Promise<TriageDomain> {
    const orm = await this.repo.findOne({ where: { id } });
    if (!orm) throw new NotFoundException(`Triage con ID ${id} no encontrado`);
    Object.assign(orm, data);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved as any);
  }

  async softDelete(id: number): Promise<void> {
    const orm = await this.repo.findOne({ where: { id } });
    if (!orm) throw new NotFoundException(`Triage con ID ${id} no encontrado`);
    orm.activo = false;
    await this.repo.save(orm);
  }
}
