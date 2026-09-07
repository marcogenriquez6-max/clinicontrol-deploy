import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { TurnoRepositoryPort } from '../../domain/ports/turno-repository.port';
import { TurnoDomain, EstadoTurno } from '../../domain/turno.domain';
import { TurnoQuery } from '../../domain/ports/turno-repository.port';
import { Turno, MetodoPago } from '../../../../entities/turno.entity';

function rangoDia(fecha?: string): { inicio: Date; fin: Date } {
  const base = fecha ? new Date(`${fecha}T00:00:00`) : new Date();
  const inicio = new Date(base);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(base);
  fin.setHours(23, 59, 59, 999);
  return { inicio, fin };
}

@Injectable()
export class TurnoRepositoryAdapter implements TurnoRepositoryPort {
  constructor(
    @InjectRepository(Turno)
    private readonly repo: Repository<Turno>,
  ) {}

  private toDomain(orm: Turno): TurnoDomain {
    const d = new TurnoDomain(
      orm.numero,
      orm.pacienteId,
      orm.medicoId,
      orm.estado as EstadoTurno,
      Number(orm.monto),
      orm.pagado,
      orm.pagadoEn,
      orm.id,
      orm.citaId,
      orm.tipoAtencionId,
      orm.tipo,
      orm.paciente
        ? `${orm.paciente.nombre} ${orm.paciente.apellido ?? ''}`.trim()
        : undefined,
      orm.paciente?.ci,
      orm.paciente?.telefono,
      `${orm.medico?.nombre || ''} ${orm.medico?.apellido || ''}`.trim(),
      orm.medico?.especialidad?.nombre,
      orm.consultorio ?? orm.medico?.consultorio ?? '',
      orm.metodoPago,
      orm.prefijo,
    );
    d.fechaProgramada = orm.fechaProgramada;
    d.horaProgramada = orm.horaProgramada;
    d.creadoEn = orm.createdAt;
    return d;
  }

  async findAll(query: TurnoQuery) {
    const { estado, medicoId, pacienteId, fecha, pagado, page = 1, limit = 50 } =
      query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (estado) {
      where.estado = estado.includes(',') ? In(estado.split(',')) : estado;
    }
    if (medicoId) where.medico = { id: medicoId };
    if (pacienteId) where.paciente = { id: pacienteId };
    if (typeof pagado === 'boolean') where.pagado = pagado;
    if (fecha) {
      const { inicio, fin } = rangoDia(fecha);
      where.createdAt = Between(inicio, fin);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['paciente', 'medico', 'medico.especialidad'],
      skip,
      take: limit,
      order: fecha ? { createdAt: 'ASC' } : { createdAt: 'DESC' },
    });

    return {
      data: data.map((o) => this.toDomain(o)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number): Promise<TurnoDomain | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'medico', 'medico.especialidad'],
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findTV(): Promise<TurnoDomain[]> {
    const { inicio, fin } = rangoDia();
    const data = await this.repo.find({
      where: {
        estado: In(['espera', 'llamado', 'atencion']),
        createdAt: Between(inicio, fin),
      },
      relations: ['paciente', 'medico', 'medico.especialidad'],
      order: { createdAt: 'ASC' },
    });
    return data.map((o) => this.toDomain(o));
  }

  async getUltimoNumero(prefijo?: string): Promise<number> {
    const { inicio, fin } = rangoDia();
    const qb = this.repo
      .createQueryBuilder('turno')
      .select('MAX(turno.numero)', 'max')
      .where('turno.created_at BETWEEN :inicio AND :fin', { inicio, fin });
    if (prefijo) {
      qb.andWhere('turno.prefijo = :prefijo', { prefijo });
    }
    const fila = await qb.getRawOne<{ max: string | number | null }>();
    return Number(fila?.max ?? 0);
  }

  async save(turno: TurnoDomain): Promise<TurnoDomain> {
    const orm = this.repo.create({
      numero: turno.numero,
      prefijo: turno.prefijo,
      pacienteId: turno.pacienteId,
      medicoId: turno.medicoId,
      citaId: turno.citaId,
      tipoAtencionId: turno.tipoAtencionId,
      tipo: turno.tipo,
      consultorio: turno.consultorio,
      estado: turno.estado,
      monto: turno.monto,
      pagado: turno.pagado,
      pagadoEn: turno.pagadoEn,
      metodoPago: turno.metodoPago,
      fechaProgramada: turno.fechaProgramada,
      horaProgramada: turno.horaProgramada,
    });
    const saved = await this.repo.save(orm);
    return this.findById(saved.id) as Promise<TurnoDomain>;
  }

  async updateEstado(id: number, estado: EstadoTurno): Promise<TurnoDomain> {
    await this.repo.update(id, { estado });
    return this.findById(id) as Promise<TurnoDomain>;
  }

  async marcarPagado(id: number, metodoPago?: MetodoPago): Promise<TurnoDomain> {
    await this.repo.update(id, {
      pagado: true,
      pagadoEn: new Date(),
      metodoPago: metodoPago ?? MetodoPago.EFECTIVO,
    });
    return this.findById(id) as Promise<TurnoDomain>;
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Turno con ID ${id} no encontrado`);
    }
  }
}
