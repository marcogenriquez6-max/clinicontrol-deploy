import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { TriageService } from '../../../modules/triage/application/triage.service';
import { ESILevel } from '../../../modules/triage/domain/triage.domain';
import {
  TurnoRepositoryPort,
  TurnoQuery,
} from '../domain/ports/turno-repository.port';
import { TurnoDomain } from '../domain/turno.domain';
import {
  CreateTurnoDto,
  MarcarPagadoDto,
} from '../infrastructure/dto/create-turno.dto';
import { Medico } from '../../../entities/medico.entity';
import { AuditService } from '../../../common/services/audit.service';
import { AuditAction } from '../../../entities/audit-log.entity';

/** Fecha local (YYYY-MM-DD) sin el desfase de toISOString (UTC). */
function fechaLocalIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Prefijo único de la clínica: los turnos se leen A001, A002, ... y reinician cada día. */
const PREFIJO_TURNO = 'A';

export interface UsuarioActual {
  id: number;
  rol: string;
  email?: string;
}

@Injectable()
export class TurnoService {
  constructor(
    private readonly turnoRepo: TurnoRepositoryPort,
    private readonly triageService: TriageService,
    private readonly auditService: AuditService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  /** Resuelve el médico vinculado al usuario logueado (o -1 si no está vinculado). */
  private async medicoIdDe(user?: UsuarioActual): Promise<number | undefined> {
    if (user?.rol !== 'medico' || !user.id) return undefined;
    const medico = await this.entityManager.getRepository(Medico).findOne({
      where: { usuarioId: user.id },
      select: { id: true } as any,
    });
    return medico ? medico.id : -1;
  }

  /**
   * Listar turnos con alcance de propiedad: un médico solo ve los suyos.
   * El scope se resuelve en el backend por `medico.usuarioId`, nunca por el
   * `medicoId` que el cliente mande (la API es la autoridad, no la pantalla).
   */
  async findAll(query: TurnoQuery, user?: UsuarioActual) {
    const scoped = { ...query };
    const medicoId = await this.medicoIdDe(user);
    if (medicoId !== undefined) scoped.medicoId = medicoId;
    return this.turnoRepo.findAll(scoped);
  }

  /**
   * Agenda del día: turnos emitidos hoy. Para el médico, solo los suyos y con
   * la marca `esUrgencia` (triaje ESI-1/ESI-2 de hoy) que permite atender sin pago.
   */
  async agendaDelDia(user?: UsuarioActual, fecha?: string) {
    const hoy = fecha ?? fechaLocalIso(new Date());
    const res = await this.findAll({ fecha: hoy, limit: 500 }, user);
    const turnos = res.data;
    const urgentes = await this.pacientesUrgentesHoy(
      turnos.filter((t) => !t.pagado).map((t) => t.pacienteId),
    );
    for (const t of turnos) {
      t.esUrgencia = !t.pagado && urgentes.has(t.pacienteId);
    }
    return turnos;
  }

  private async pacientesUrgentesHoy(pacienteIds: number[]): Promise<Set<number>> {
    const set = new Set<number>();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    for (const pid of new Set(pacienteIds)) {
      const triajes = await this.triageService.findByPaciente(pid);
      const urgente = triajes.some((t) => {
        if (!t.fechaHora) return false;
        const f = new Date(t.fechaHora);
        return (
          (t.esiNivel === ESILevel.UNO || t.esiNivel === ESILevel.DOS) &&
          f >= hoy &&
          f < manana
        );
      });
      if (urgente) set.add(pid);
    }
    return set;
  }

  async findOne(id: number): Promise<TurnoDomain> {
    const turno = await this.turnoRepo.findById(id);
    if (!turno) {
      throw new NotFoundException(`Turno con ID ${id} no encontrado`);
    }
    return turno;
  }

  async getTV() {
    return this.turnoRepo.findTV();
  }

  async create(dto: CreateTurnoDto, user?: UsuarioActual): Promise<TurnoDomain> {
    const medico = await this.entityManager.getRepository(Medico).findOne({
      where: { id: dto.medicoId },
    });
    if (!medico) {
      throw new NotFoundException(`Médico ${dto.medicoId} no encontrado`);
    }
    const ultimoNumero = await this.turnoRepo.getUltimoNumero(PREFIJO_TURNO);
    const domain = TurnoDomain.create({
      numero: ultimoNumero + 1,
      prefijo: PREFIJO_TURNO,
      pacienteId: dto.pacienteId,
      medicoId: dto.medicoId,
      citaId: dto.citaId,
      tipoAtencionId: dto.tipoAtencionId,
      tipo: dto.tipo,
      consultorio: dto.consultorio ?? medico.consultorio,
      monto: dto.monto,
      pagado: dto.pagado,
      metodoPago: dto.metodoPago,
      creadoPorId: user?.id ?? 0,
      fechaProgramada: dto.fechaProgramada,
      horaProgramada: dto.horaProgramada,
    });
    const saved = await this.turnoRepo.save(domain);
    if (user) {
      this.auditService
        .log({
          userId: String(user.id),
          userEmail: user.email,
          action: AuditAction.CREATE,
          entityType: 'turno',
          entityId: String(saved.id),
          newValue: {
            turno: `${PREFIJO_TURNO}${String(saved.numero).padStart(3, '0')}`,
            pacienteId: saved.pacienteId,
            medicoId: saved.medicoId,
            monto: saved.monto,
          },
        })
        .catch(() => {});
    }
    return saved;
  }

  async updateEstado(
    id: number,
    estado: string,
    user?: UsuarioActual,
  ): Promise<TurnoDomain> {
    const turno = await this.findOne(id);

    if (estado === 'atencion' && !turno.pagado) {
      // Regla de cobro previo: el paciente paga en recepción antes de pasar al
      // médico. Excepción: triaje ESI-1/ESI-2 de HOY (urgencia vital).
      const urgentes = await this.pacientesUrgentesHoy([turno.pacienteId]);
      if (!urgentes.has(turno.pacienteId)) {
        throw new ConflictException(
          `El turno ${PREFIJO_TURNO}${String(turno.numero).padStart(3, '0')} no tiene pago registrado. El paciente debe pagar en recepción antes de ser atendido.`,
        );
      }
    }

    const anterior = turno.estado;
    try {
      switch (estado) {
        case 'llamado':
          turno.llamar();
          break;
        case 'atencion':
          turno.iniciarAtencion();
          break;
        case 'completado':
          turno.completar();
          break;
        case 'cancelado':
          turno.cancelar();
          break;
        case 'no_asistio':
          turno.noAsistio();
          break;
        default:
          throw new BadRequestException(`Estado inválido: ${estado}`);
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException((e as Error).message);
    }
    const actualizado = await this.turnoRepo.updateEstado(id, turno.estado);
    if (user) {
      this.auditService
        .log({
          userId: String(user.id),
          userEmail: user.email,
          action: AuditAction.UPDATE,
          entityType: 'turno',
          entityId: String(id),
          oldValue: { estado: anterior },
          newValue: { estado: turno.estado },
        })
        .catch(() => {});
    }
    return actualizado;
  }

  async marcarPagado(id: number, dto: MarcarPagadoDto): Promise<TurnoDomain> {
    const turno = await this.findOne(id);
    turno.marcarPagado(dto.metodoPago);
    return this.turnoRepo.marcarPagado(id, dto.metodoPago);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.turnoRepo.remove(id);
  }
}
