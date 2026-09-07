import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CitaRepositoryPort } from '../domain/ports/cita-repository.port';
import { CitaDomainService } from '../domain/services/cita-domain.service';
import { CitaDomain } from '../domain/cita.domain';
import {
  CreateCitaDto,
  UpdateCitaDto,
  CitaQueryDto,
} from '../infrastructure/dto/create-cita.dto';
import { TurnoService } from '../../turno/application/turno.service';
import { DisponibilidadService } from '../../disponibilidad/application/disponibilidad.service';
import { Paciente } from '../../../entities/paciente.entity';
import { Medico } from '../../../entities/medico.entity';
import { Servicio } from '../../../entities/servicio.entity';
import { Consulta } from '../../../entities/consulta.entity';

@Injectable()
export class CitaService {
  constructor(
    private readonly citaRepo: CitaRepositoryPort,
    private readonly citaDomainService: CitaDomainService,
    private readonly turnoService: TurnoService,
    private readonly disponibilidadService: DisponibilidadService,
    @InjectRepository(Paciente)
    private readonly pacienteRepo: Repository<Paciente>,
    @InjectRepository(Medico)
    private readonly medicoRepo: Repository<Medico>,
    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(Consulta)
    private readonly consultaRepo: Repository<Consulta>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: CitaQueryDto) {
    return this.citaRepo.findAll(query);
  }

  async findOne(id: number): Promise<CitaDomain> {
    const cita = await this.citaRepo.findById(id);
    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }
    return cita;
  }

  async getDisponibilidad(medicoId: number, fecha: Date) {
    const data = await this.citaRepo.findDisponibilidad(medicoId, fecha);
    return {
      fecha,
      medicoId,
      citasOcupadas: data.filter(
        (d) => d.estado !== 'cancelada' && d.estado !== 'no_asistio',
      ),
      totalCitas: data.filter(
        (d) => d.estado !== 'cancelada' && d.estado !== 'no_asistio',
      ).length,
    };
  }

  async getSlots(
    medicoId: number,
    fecha: string,
    servicioId?: number,
  ) {
    return this.disponibilidadService.getSlots(medicoId, fecha, servicioId);
  }

  private validarFechaNoPasada(fecha: Date | string): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaCita = new Date(fecha);
    fechaCita.setHours(0, 0, 0, 0);
    if (fechaCita < hoy) {
      throw new BadRequestException(
        'No se puede agendar una cita en una fecha pasada',
      );
    }
  }

  async create(dto: CreateCitaDto, usuarioId: number): Promise<CitaDomain> {
    this.validarFechaNoPasada(dto.fecha);

    const paciente = await this.pacienteRepo.findOne({
      where: { id: dto.pacienteId },
    });
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${dto.pacienteId} no encontrado`);
    }

    const medico = await this.medicoRepo.findOne({
      where: { id: dto.medicoId },
    });
    if (!medico) {
      throw new NotFoundException(`Médico con ID ${dto.medicoId} no encontrado`);
    }

    const horaFinSolicitada = dto.horaFin;
    const horaFin =
      horaFinSolicitada ??
      (await this.disponibilidadService.calcularHoraFin(
        dto.horaInicio,
        dto.servicioId,
      ));

    // Validación completa de disponibilidad (cadena)
    await this.disponibilidadService.validarDisponibilidad({
      medicoId: dto.medicoId,
      servicioId: dto.servicioId,
      fecha: dto.fecha,
      horaInicio: dto.horaInicio,
      horaFin,
    });

    const domain = CitaDomain.create({
      pacienteId: dto.pacienteId,
      medicoId: dto.medicoId,
      fecha: dto.fecha,
      horaInicio: dto.horaInicio,
      horaFin,
      esVirtual: dto.esVirtual,
      motivo: dto.motivo,
      sucursalId: dto.sucursalId,
      observaciones: dto.observaciones,
      creadoPorId: usuarioId,
      especialidadId: dto.especialidadId,
      servicioId: dto.servicioId,
      tipoAtencionId: dto.tipoAtencionId,
    });

    return this.citaRepo.save(domain);
  }

  async update(id: number, dto: UpdateCitaDto): Promise<CitaDomain> {
    const cita = await this.findOne(id);

    if (dto.fecha) this.validarFechaNoPasada(dto.fecha);

    if (dto.pacienteId !== undefined && dto.pacienteId !== cita.pacienteId) {
      const paciente = await this.pacienteRepo.findOne({
        where: { id: dto.pacienteId },
      });
      if (!paciente) {
        throw new NotFoundException(`Paciente con ID ${dto.pacienteId} no encontrado`);
      }
    }

    if (dto.medicoId !== undefined && dto.medicoId !== cita.medicoId) {
      const medico = await this.medicoRepo.findOne({
        where: { id: dto.medicoId },
      });
      if (!medico) {
        throw new NotFoundException(`Médico con ID ${dto.medicoId} no encontrado`);
      }
    }

    if (dto.horaInicio || dto.horaFin || dto.fecha) {
      const newHoraInicio = dto.horaInicio ?? cita.horaInicio;
      const newHoraFin = dto.horaFin ?? cita.horaFin;
      const newFecha = dto.fecha ?? cita.fecha;
      const medicoId = dto.medicoId ?? cita.medicoId;

      CitaDomain.validarHorario(newHoraInicio, newHoraFin);

      await this.disponibilidadService.validarDisponibilidad({
        medicoId,
        servicioId: dto.servicioId ?? cita.servicioId,
        fecha: newFecha,
        horaInicio: newHoraInicio,
        horaFin: newHoraFin,
        excludeCitaId: id,
      });
    }

    if (dto.estadoId !== undefined) {
      const mapa: Record<number, CitaDomain['estado']> = {
        1: 'pendiente',
        2: 'confirmada',
        3: 'en_curso',
        4: 'completada',
        5: 'cancelada',
        6: 'no_asistio',
        7: 'reprogramada',
      };
      const estado = mapa[dto.estadoId];
      if (estado) {
        cita.estado = estado;
      }
    }
    if (dto.fecha !== undefined) cita.fecha = dto.fecha;
    if (dto.horaInicio !== undefined) cita.horaInicio = dto.horaInicio;
    if (dto.horaFin !== undefined) cita.horaFin = dto.horaFin;
    if (dto.motivo !== undefined) cita.motivo = dto.motivo;
    if (dto.observaciones !== undefined) cita.observaciones = dto.observaciones;
    if (dto.cancelacionMotivo !== undefined)
      cita.cancelacionMotivo = dto.cancelacionMotivo;
    if (dto.especialidadId !== undefined)
      cita.especialidadId = dto.especialidadId;
    if (dto.servicioId !== undefined) cita.servicioId = dto.servicioId;
    if (dto.tipoAtencionId !== undefined)
      cita.tipoAtencionId = dto.tipoAtencionId;

    const saved = await this.citaRepo.save(cita);

    // Req 30: historial automático — crear Consulta al completar cita
    if (dto.estadoId === 4 && cita.estado === 'completada') {
      const existingConsulta = await this.consultaRepo.findOne({ where: { citaId: saved.id } });
      if (!existingConsulta) {
        await this.consultaRepo.save(this.consultaRepo.create({
          pacienteId: saved.pacienteId,
          medicoId: saved.medicoId,
          citaId: saved.id,
          fecha: new Date(),
          motivo: saved.motivo || 'Atención programada desde cita #' + saved.id,
        }));
      }
    }

    return saved;
  }

  async cancelar(
    id: number,
    motivo: string,
    usuarioId: number,
  ): Promise<CitaDomain> {
    const cita = await this.findOne(id);
    cita.cancelar(motivo, usuarioId);
    return this.citaRepo.save(cita);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.citaRepo.remove(id);
  }

  async reprogramar(
    id: number,
    dto: { fecha: Date; horaInicio: string; servicioId?: number },
  ): Promise<CitaDomain> {
    const cita = await this.findOne(id);
    this.validarFechaNoPasada(dto.fecha);

    const horaFin = await this.disponibilidadService.calcularHoraFin(
      dto.horaInicio,
      dto.servicioId ?? cita.servicioId,
    );

    await this.disponibilidadService.validarDisponibilidad({
      medicoId: cita.medicoId,
      servicioId: dto.servicioId ?? cita.servicioId,
      fecha: dto.fecha,
      horaInicio: dto.horaInicio,
      horaFin,
      excludeCitaId: id,
    });

    cita.reprogramar(dto.fecha, dto.horaInicio, horaFin);
    if (dto.servicioId !== undefined) cita.servicioId = dto.servicioId;
    return this.citaRepo.save(cita);
  }

  async llegada(
    id: number,
    usuarioId: number,
  ): Promise<{ cita: CitaDomain; turno: any }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cita = await this.findOne(id);

      // Validar que la cita esté en estado pendiente o confirmada
      const esPendienteOConfirmada =
        cita.estado === 'pendiente' || cita.estado === 'confirmada';
      if (!esPendienteOConfirmada) {
        throw new BadRequestException(
          'La cita no está en estado pendiente o confirmada',
        );
      }

      // A3: Validar que la cita sea de HOY
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaCita = new Date(cita.fecha);
      fechaCita.setHours(0, 0, 0, 0);
      if (fechaCita.getTime() !== hoy.getTime()) {
        throw new BadRequestException(
          'Solo se puede registrar llegada para citas de hoy',
        );
      }

      // Verificar que no tenga turno previo (llegada doble)
      const { data: turnosDelDia } = await this.turnoService.findAll({
        pacienteId: cita.pacienteId,
        fecha: cita.fecha.toISOString().split('T')[0],
      });

      const fechaCitaStr = cita.fecha.toISOString().split('T')[0];
      const tieneTurnoPrevio = turnosDelDia.some(
        (t: any) =>
          String(t.fechaProgramada)?.substring(0, 10) === fechaCitaStr &&
          t.estado !== 'cancelado',
      );

      if (tieneTurnoPrevio) {
        throw new ConflictException(`La cita ya tiene un turno emitido`);
      }

      // Calcular monto según el servicio de la cita
      let monto = 0;
      let nombreServicio = '';
      if (cita.servicioId) {
        const servicio = await this.servicioRepo.findOne({
          where: { id: cita.servicioId },
        });
        monto = Number(servicio?.monto ?? 0);
        nombreServicio = servicio?.nombre ?? '';
      }

      // Consultorio del médico asignado a la cita (para el ticket y la sala)
      const medico = await this.medicoRepo.findOne({
        where: { id: cita.medicoId },
        select: { consultorio: true } as any,
      });

      // Crear el turno usando el servicio de turno (dentro de la transacción)
      // Vincula el turno a la cita (citaId) y propaga el nombre del servicio
      // como `tipo` y el consultorio para que el ticket y la sala muestren el
      // servicio y consultorio reales.
      const turnoRes = await this.turnoService.create({
        pacienteId: cita.pacienteId,
        medicoId: cita.medicoId,
        citaId: cita.id,
        monto,
        pagado: false,
        tipoAtencionId: cita.tipoAtencionId,
        tipo: nombreServicio || undefined,
        consultorio: medico?.consultorio ?? undefined,
        fechaProgramada: cita.fecha.toISOString().split('T')[0],
        horaProgramada: cita.horaInicio,
      });

      // Marcar la cita como en_curso (atendida)
      cita.estado = 'en_curso';
      await this.citaRepo.save(cita);

      await queryRunner.commitTransaction();

      return { cita, turno: turnoRes };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
