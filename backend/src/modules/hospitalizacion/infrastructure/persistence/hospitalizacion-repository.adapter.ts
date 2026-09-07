import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  HospitalizacionRepositoryPort,
  HospitalizacionQuery,
  PaginationMeta,
} from '../../domain/ports/hospitalizacion-repository.port';
import {
  HospitalizacionDomain,
  CamaDomain,
  NotaEvolucionDomain,
  BedStatus,
  AdmisionEstado,
} from '../../domain/hospitalizacion.domain';
import {
  Hospitalizacion,
  Cama,
  NotaEvolucion,
} from '../../../../entities/hospitalizacion.entity';

@Injectable()
export class HospitalizacionRepositoryAdapter implements HospitalizacionRepositoryPort {
  constructor(
    @InjectRepository(Hospitalizacion)
    private readonly hospRepository: Repository<Hospitalizacion>,
    @InjectRepository(Cama)
    private readonly camaRepository: Repository<Cama>,
    @InjectRepository(NotaEvolucion)
    private readonly notaRepository: Repository<NotaEvolucion>,
    private readonly dataSource: DataSource,
  ) {}

  private hospToDomain(orm: Hospitalizacion): HospitalizacionDomain {
    return new HospitalizacionDomain(
      orm.id,
      orm.pacienteId,
      orm.medicoTratanteId,
      orm.camaId,
      orm.fechaIngreso,
      orm.fechaAlta,
      orm.motivoIngreso,
      orm.diagnosticoIngreso,
      orm.observaciones,
      orm.estado,
      orm.usuarioRegistroId,
      orm.notasAlta,
      orm.diagnosticoAlta,
      orm.activo,
    );
  }

  private camaToDomain(orm: Cama): CamaDomain {
    return new CamaDomain(
      orm.id,
      orm.codigoCama,
      orm.servicio,
      orm.piso,
      orm.habitacion,
      orm.estado,
      orm.activo,
    );
  }

  private notaToDomain(orm: NotaEvolucion): NotaEvolucionDomain {
    return new NotaEvolucionDomain(
      orm.id,
      orm.hospitalizacionId,
      orm.fecha,
      orm.nota,
      orm.plan,
      orm.indicaciones,
      orm.realizadoPorId,
      orm.activo,
    );
  }

  async create(
    data: Partial<HospitalizacionDomain>,
    usuarioId: number,
  ): Promise<HospitalizacionDomain> {
    return this.dataSource.transaction(async (manager) => {
      const camaRepo = manager.withRepository(this.camaRepository);
      const hospRepo = manager.withRepository(this.hospRepository);

      const cama = await camaRepo.findOne({
        where: { id: data.camaId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!cama)
        throw new NotFoundException(`Cama ${data.camaId} no encontrada`);
      if (cama.estado !== BedStatus.DISPONIBLE) {
        throw new ConflictException(
          `Cama ${cama.codigoCama} no está disponible (${cama.estado})`,
        );
      }

      const existing = await hospRepo.findOne({
        where: {
          pacienteId: data.pacienteId,
          estado: AdmisionEstado.ADMITIDO,
          activo: true,
        },
      });
      if (existing)
        throw new ConflictException(
          'El paciente ya tiene una hospitalización activa',
        );

      const hosp = hospRepo.create({
        ...data,
        usuarioRegistroId: usuarioId,
        estado: AdmisionEstado.ADMITIDO,
      } as any);
      const saved = (await hospRepo.save(hosp)) as any;
      await camaRepo.update(data.camaId!, { estado: BedStatus.OCUPADO } as any);

      return this.hospToDomain(saved as any);
    });
  }

  async findAll(
    query: HospitalizacionQuery,
  ): Promise<{ data: HospitalizacionDomain[]; meta: PaginationMeta }> {
    const { estado, pacienteId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { activo: true };
    if (estado) where.estado = estado;
    if (pacienteId) where.pacienteId = pacienteId;

    const [data, total] = await this.hospRepository.findAndCount({
      where,
      relations: ['paciente', 'medicoTratante', 'cama', 'usuarioRegistro'],
      skip,
      take: limit,
      order: { fechaIngreso: 'DESC' },
    });

    return {
      data: data.map((o) => this.hospToDomain(o)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number): Promise<HospitalizacionDomain | null> {
    const orm = await this.hospRepository.findOne({
      where: { id },
      relations: [
        'paciente',
        'medicoTratante',
        'cama',
        'usuarioRegistro',
        'notasEvolucion',
      ],
    });
    return orm ? this.hospToDomain(orm) : null;
  }

  async update(
    id: number,
    data: Partial<HospitalizacionDomain>,
  ): Promise<HospitalizacionDomain> {
    const hosp = await this.hospRepository.findOne({ where: { id } });
    if (!hosp)
      throw new NotFoundException(`Hospitalización ${id} no encontrada`);

    if (data.camaId && data.camaId !== hosp.camaId) {
      const newCama = await this.camaRepository.findOne({
        where: { id: data.camaId },
      });
      if (!newCama)
        throw new NotFoundException(`Cama ${data.camaId} no encontrada`);
      if (newCama.estado !== BedStatus.DISPONIBLE) {
        throw new ConflictException(`Cama ${newCama.codigoCama} no disponible`);
      }
      await this.camaRepository.update(hosp.camaId, {
        estado: BedStatus.LIMPIEZA,
      } as any);
      await this.camaRepository.update(data.camaId, {
        estado: BedStatus.OCUPADO,
      } as any);
    }

    if (
      data.estado === AdmisionEstado.ALTA &&
      hosp.estado !== AdmisionEstado.ALTA
    ) {
      await this.camaRepository.update(hosp.camaId, {
        estado: BedStatus.LIMPIEZA,
      } as any);
      if (!data.fechaAlta) data.fechaAlta = new Date();
    }

    Object.assign(hosp, data);
    const saved = await this.hospRepository.save(hosp);
    return this.hospToDomain(saved as any);
  }

  async darAlta(
    id: number,
    dto: { fechaAlta: Date; notasAlta?: string; diagnosticoAlta?: string },
  ): Promise<HospitalizacionDomain> {
    const hosp = await this.hospRepository.findOne({ where: { id } });
    if (!hosp)
      throw new NotFoundException(`Hospitalización ${id} no encontrada`);
    if (hosp.estado === AdmisionEstado.ALTA)
      throw new BadRequestException('El paciente ya fue dado de alta');

    hosp.estado = AdmisionEstado.ALTA;
    hosp.fechaAlta = dto.fechaAlta;
    if (dto.notasAlta !== undefined) hosp.notasAlta = dto.notasAlta;
    if (dto.diagnosticoAlta !== undefined)
      hosp.diagnosticoAlta = dto.diagnosticoAlta;
    await this.camaRepository.update(hosp.camaId, {
      estado: BedStatus.LIMPIEZA,
    } as any);
    const saved = await this.hospRepository.save(hosp);
    return this.hospToDomain(saved as any);
  }

  async softDelete(id: number): Promise<void> {
    const hosp = await this.hospRepository.findOne({ where: { id } });
    if (!hosp)
      throw new NotFoundException(`Hospitalización ${id} no encontrada`);
    await this.camaRepository.update(hosp.camaId, {
      estado: BedStatus.DISPONIBLE,
    } as any);
    hosp.activo = false;
    await this.hospRepository.save(hosp);
  }

  async createCama(dto: Partial<CamaDomain>): Promise<CamaDomain> {
    const existing = await this.camaRepository.findOne({
      where: { codigoCama: dto.codigoCama },
    });
    if (existing)
      throw new ConflictException(`Código de cama ${dto.codigoCama} ya existe`);
    const cama = this.camaRepository.create(dto as any);
    const saved = await this.camaRepository.save(cama);
    return this.camaToDomain(saved as any);
  }

  async findAllCamas(servicio?: string): Promise<CamaDomain[]> {
    const where: Record<string, unknown> = { activo: true };
    if (servicio) where.servicio = servicio;
    const orms = await this.camaRepository.find({
      where,
      order: { servicio: 'ASC', codigoCama: 'ASC' },
    });
    return orms.map((o) => this.camaToDomain(o));
  }

  async findCamaById(id: number): Promise<CamaDomain | null> {
    const orm = await this.camaRepository.findOne({ where: { id } });
    return orm ? this.camaToDomain(orm) : null;
  }

  async updateCama(id: number, data: Partial<CamaDomain>): Promise<CamaDomain> {
    const cama = await this.camaRepository.findOne({ where: { id } });
    if (!cama) throw new NotFoundException(`Cama ${id} no encontrada`);
    Object.assign(cama, data);
    const saved = await this.camaRepository.save(cama);
    return this.camaToDomain(saved as any);
  }

  async removeCama(id: number): Promise<void> {
    const cama = await this.camaRepository.findOne({ where: { id } });
    if (!cama) throw new NotFoundException(`Cama ${id} no encontrada`);
    if (cama.estado === BedStatus.OCUPADO)
      throw new BadRequestException('No se puede eliminar una cama ocupada');
    cama.activo = false;
    await this.camaRepository.save(cama);
  }

  async getCamasDisponibles(servicio?: string): Promise<CamaDomain[]> {
    const where: Record<string, unknown> = {
      estado: BedStatus.DISPONIBLE,
      activo: true,
    };
    if (servicio) where.servicio = servicio;
    const orms = await this.camaRepository.find({
      where,
      order: { servicio: 'ASC', codigoCama: 'ASC' },
    });
    return orms.map((o) => this.camaToDomain(o));
  }

  async createNotaEvolucion(
    hospId: number,
    dto: { fecha: string | Date; nota: string; plan?: string; indicaciones?: string },
    usuarioId: number,
  ): Promise<NotaEvolucionDomain> {
    const nota = this.notaRepository.create({
      ...dto,
      hospitalizacionId: hospId,
      realizadoPorId: usuarioId,
    });
    const saved = await this.notaRepository.save(nota);
    return this.notaToDomain(saved as any);
  }

  async findNotasEvolucion(hospId: number): Promise<NotaEvolucionDomain[]> {
    const orms = await this.notaRepository.find({
      where: { hospitalizacionId: hospId, activo: true },
      relations: ['realizadoPor'],
      order: { fecha: 'DESC', createdAt: 'DESC' },
    });
    return orms.map((o) => this.notaToDomain(o));
  }

  async getStats(): Promise<{
    totalCamas: number;
    ocupadas: number;
    disponibles: number;
    enLimpieza: number;
    ocupacion: number;
  }> {
    const [totalCamas, ocupadas, disponibles, limpieza] = await Promise.all([
      this.camaRepository.count({ where: { activo: true } }),
      this.camaRepository.count({
        where: { estado: BedStatus.OCUPADO, activo: true },
      }),
      this.camaRepository.count({
        where: { estado: BedStatus.DISPONIBLE, activo: true },
      }),
      this.camaRepository.count({
        where: { estado: BedStatus.LIMPIEZA, activo: true },
      }),
    ]);
    return {
      totalCamas,
      ocupadas,
      disponibles,
      enLimpieza: limpieza,
      ocupacion: totalCamas > 0 ? Math.round((ocupadas / totalCamas) * 100) : 0,
    };
  }
}
