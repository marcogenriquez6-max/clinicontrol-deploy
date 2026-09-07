import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Brackets, Repository } from 'typeorm';
import { Pago } from '../../../entities/pago.entity';
import { Turno, MetodoPago } from '../../../entities/turno.entity';
import { Paciente } from '../../../entities/paciente.entity';
import { Sucursal } from '../../../entities/sucursal.entity';
import { AuditService } from '../../../common/services/audit.service';
import { AuditAction } from '../../../entities/audit-log.entity';
import {
  AnularPagoDto,
  PagoQueryDto,
  RegistrarPagoDto,
} from '../infrastructure/dto/pago.dto';

export interface PagoVista {
  id: number;
  numeroRecibo: string;
  turnoId?: number;
  turnoNumero?: number;
  turnoPrefijo?: string;
  pacienteId: number;
  pacienteNombre: string;
  pacienteCI: string;
  concepto: string;
  monto: number;
  metodoPago: string;
  estado: string;
  fecha: Date;
  usuarioId: number;
  usuarioNombre?: string;
  observaciones?: string;
  motivoAnulacion?: string;
}

export interface TurnoPendientePago {
  turnoId: number;
  numero: number;
  prefijo?: string;
  pacienteId: number;
  pacienteNombre: string;
  pacienteCI: string;
  concepto: string;
  monto: number;
  medicoNombre: string;
  horaProgramada?: string;
  createdAt: Date;
  estado: string;
}

function rangoDia(fecha?: string): { inicio: Date; fin: Date } {
  const base = fecha ? new Date(`${fecha}T00:00:00`) : new Date();
  const inicio = new Date(base);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(base);
  fin.setHours(23, 59, 59, 999);
  return { inicio, fin };
}

function rangoPeriodo(fechaInicio?: string, fechaFin?: string) {
  const { inicio } = rangoDia(fechaInicio);
  const { fin } = rangoDia(fechaFin ?? fechaInicio);
  return { inicio, fin };
}

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago) private readonly pagoRepo: Repository<Pago>,
    @InjectRepository(Turno) private readonly turnoRepo: Repository<Turno>,
    @InjectRepository(Paciente)
    private readonly pacienteRepo: Repository<Paciente>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepo: Repository<Sucursal>,
    private readonly auditService: AuditService,
  ) {}

  private toVista(p: Pago): PagoVista {
    return {
      id: p.id,
      numeroRecibo: p.numeroRecibo,
      turnoId: p.turnoId,
      turnoNumero: p.turno?.numero,
      turnoPrefijo: p.turno?.prefijo,
      pacienteId: p.pacienteId,
      pacienteNombre: p.paciente
        ? `${p.paciente.nombre} ${p.paciente.apellido}`.trim()
        : '',
      pacienteCI: p.paciente?.ci ?? '',
      concepto: p.concepto,
      monto: Number(p.monto),
      metodoPago: p.metodoPago,
      estado: p.estado,
      fecha: p.fecha,
      usuarioId: p.usuarioId,
      usuarioNombre: p.usuario
        ? `${p.usuario.nombre} ${p.usuario.apellido ?? ''}`.trim()
        : undefined,
      observaciones: p.observaciones,
      motivoAnulacion: p.motivoAnulacion,
    };
  }

  async findAll(query: PagoQueryDto) {
    const { page = 1, limit = 50 } = query;
    const qb = this.pagoRepo
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.paciente', 'paciente')
      .leftJoinAndSelect('pago.turno', 'turno')
      .leftJoinAndSelect('pago.usuario', 'usuario')
      .orderBy('pago.fecha', 'DESC');

    if (query.fechaInicio || query.fechaFin) {
      const { inicio, fin } = rangoPeriodo(query.fechaInicio, query.fechaFin);
      qb.andWhere('pago.fecha BETWEEN :inicio AND :fin', { inicio, fin });
    }
    if (query.pacienteId) {
      qb.andWhere('pago.paciente_id = :pacienteId', {
        pacienteId: query.pacienteId,
      });
    }
    if (query.estado) {
      qb.andWhere('pago.estado = :estado', { estado: query.estado });
    }
    if (query.q) {
      const q = `%${query.q.trim()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('paciente.nombre ILIKE :q', { q })
            .orWhere('paciente.apellido ILIKE :q', { q })
            .orWhere('paciente.ci ILIKE :q', { q })
            .orWhere('pago.numero_recibo ILIKE :q', { q })
            .orWhere('pago.concepto ILIKE :q', { q });
        }),
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalMonto = data
      .filter((p) => p.estado === 'pagado')
      .reduce((s, p) => s + Number(p.monto), 0);

    return {
      data: data.map((p) => this.toVista(p)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalMonto,
      },
    };
  }

  async findOne(id: number): Promise<PagoVista> {
    const pago = await this.pagoRepo.findOne({
      where: { id },
      relations: ['paciente', 'turno', 'usuario'],
    });
    if (!pago) throw new NotFoundException(`Recibo ${id} no encontrado`);
    return this.toVista(pago);
  }

  /** Datos completos para imprimir el recibo (clínica + pago). */
  async recibo(id: number) {
    const pago = await this.findOne(id);
    const clinica = await this.sucursalRepo.findOne({
      where: {},
      order: { id: 'ASC' },
    });
    return {
      clinica: {
        nombre: clinica?.nombre ?? 'Clínica Santa Isabel',
        direccion: clinica?.direccion ?? '',
        telefono: clinica?.telefono ?? '',
        nit: clinica?.rnc ?? '',
      },
      pago,
    };
  }

  /** Turnos del día (o de la fecha dada) que aún no registran pago. */
  async pendientes(fecha?: string): Promise<TurnoPendientePago[]> {
    const { inicio, fin } = rangoDia(fecha);
    const turnos = await this.turnoRepo.find({
      where: { createdAt: Between(inicio, fin), pagado: false },
      relations: ['paciente', 'medico'],
      order: { createdAt: 'ASC' },
    });
    return turnos
      .filter((t) => t.estado !== 'cancelado' && t.estado !== 'no_asistio')
      .map((t) => ({
        turnoId: t.id,
        numero: t.numero,
        prefijo: t.prefijo,
        pacienteId: t.pacienteId,
        pacienteNombre: t.paciente
          ? `${t.paciente.nombre} ${t.paciente.apellido}`.trim()
          : '',
        pacienteCI: t.paciente?.ci ?? '',
        concepto: t.tipo || 'Consulta Médica',
        monto: Number(t.monto),
        medicoNombre: t.medico
          ? `${t.medico.nombre} ${t.medico.apellido}`.trim()
          : '',
        horaProgramada: t.horaProgramada,
        createdAt: t.createdAt,
        estado: t.estado,
      }));
  }

  async resumen(fechaInicio?: string, fechaFin?: string) {
    const { inicio, fin } = rangoPeriodo(fechaInicio, fechaFin);
    const pagos = await this.pagoRepo.find({
      where: { fecha: Between(inicio, fin), estado: 'pagado' },
    });
    return {
      cantidad: pagos.length,
      total: pagos.reduce((s, p) => s + Number(p.monto), 0),
      desde: inicio,
      hasta: fin,
    };
  }

  async registrar(
    dto: RegistrarPagoDto,
    usuario: { id: number; email?: string },
  ): Promise<PagoVista> {
    let turno: Turno | null = null;
    if (dto.turnoId) {
      turno = await this.turnoRepo.findOne({
        where: { id: dto.turnoId },
        relations: ['paciente'],
      });
      if (!turno)
        throw new NotFoundException(`Turno ${dto.turnoId} no encontrado`);
      if (turno.pagado) {
        throw new ConflictException(
          `El turno ya tiene un pago registrado. Busque el recibo en la lista de Recibos.`,
        );
      }
      if (turno.estado === 'cancelado') {
        throw new BadRequestException(
          'No se puede registrar el pago de un turno cancelado',
        );
      }
    }

    const pacienteId = turno?.pacienteId ?? dto.pacienteId;
    if (!pacienteId) {
      throw new BadRequestException(
        'Indique el turno o el paciente al que corresponde el pago',
      );
    }
    const paciente = await this.pacienteRepo.findOne({
      where: { id: pacienteId },
    });
    if (!paciente)
      throw new NotFoundException(`Paciente ${pacienteId} no encontrado`);

    const concepto = (dto.concepto ?? turno?.tipo ?? 'Consulta Médica').trim();
    const monto = dto.monto ?? Number(turno?.monto ?? 0);
    if (monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor a cero');
    }

    const saved = await this.pagoRepo.manager.transaction(async (em) => {
      const repo = em.getRepository(Pago);
      const nuevo = repo.create({
        numeroRecibo: 'PENDIENTE',
        turnoId: turno?.id,
        pacienteId,
        concepto,
        monto,
        metodoPago: 'efectivo',
        estado: 'pagado',
        fecha: new Date(),
        usuarioId: usuario.id,
        observaciones: dto.observaciones,
      });
      const guardado = await repo.save(nuevo);
      guardado.numeroRecibo = `R-${String(guardado.id).padStart(6, '0')}`;
      await repo.save(guardado);

      if (turno) {
        await em.getRepository(Turno).update(turno.id, {
          pagado: true,
          pagadoEn: new Date(),
          metodoPago: MetodoPago.EFECTIVO,
          monto,
        });
      }
      return guardado;
    });

    this.auditService
      .log({
        userId: String(usuario.id),
        userEmail: usuario.email,
        action: AuditAction.CREATE,
        entityType: 'pago',
        entityId: String(saved.id),
        newValue: {
          numeroRecibo: saved.numeroRecibo,
          pacienteId,
          concepto,
          monto,
          turnoId: turno?.id,
        },
      })
      .catch(() => {});

    return this.findOne(saved.id);
  }

  async anular(
    id: number,
    dto: AnularPagoDto,
    usuario: { id: number; email?: string },
  ): Promise<PagoVista> {
    const pago = await this.pagoRepo.findOne({ where: { id } });
    if (!pago) throw new NotFoundException(`Recibo ${id} no encontrado`);
    if (pago.estado === 'anulado') {
      throw new ConflictException('El recibo ya fue anulado');
    }
    await this.pagoRepo.manager.transaction(async (em) => {
      await em
        .getRepository(Pago)
        .update(id, { estado: 'anulado', motivoAnulacion: dto.motivo });
      if (pago.turnoId) {
        await em.getRepository(Turno).update(pago.turnoId, {
          pagado: false,
          pagadoEn: undefined,
          metodoPago: undefined,
        });
      }
    });
    this.auditService
      .log({
        userId: String(usuario.id),
        userEmail: usuario.email,
        action: AuditAction.UPDATE,
        entityType: 'pago',
        entityId: String(id),
        oldValue: { estado: 'pagado' },
        newValue: { estado: 'anulado', motivo: dto.motivo },
      })
      .catch(() => {});
    return this.findOne(id);
  }
}
