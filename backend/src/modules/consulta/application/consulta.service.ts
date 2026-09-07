import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import {
  ConsultaRepositoryPort,
  ConsultaQuery,
} from '../domain/ports/consulta-repository.port';
import {
  ConsultaDomain,
  SignosVitales,
  DiagnosticoEntry,
} from '../domain/consulta.domain';
import { ConsultaDomainService } from '../domain/services/consulta-domain.service';
import { InmutabilidadExpedienteService } from '../domain/services/inmutabilidad-expediente.service';
import { PacienteRepositoryPort } from '../../paciente/domain/ports/paciente-repository.port';
import { MedicoRepositoryPort } from '../../medico/domain/ports/medico-repository.port';
import { AuditService } from '../../../common/services/audit.service';
import { RecetaService } from '../../receta/application/receta.service';
import { AuditAction } from '../../../entities/audit-log.entity';
import { TipoNotaEvolucion } from '../../../entities/nota-evolucion.entity';

export interface CreateConsultaCompletaInput {
  pacienteId: number;
  medicoId: number;
  citaId?: number;
  motivoConsulta?: string;
  sintomas?: string;
  enfermedadActual?: string;
  examenFisico?: string;
  peso?: number;
  talla?: number;
  temperatura?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  presionArterialSistolica?: number;
  presionArterialDiastolica?: number;
  saturacionOxigeno?: number;
  glucosaCapilar?: number;
  evaluacion?: string;
  planTratamiento?: string;
  indicaciones?: string;
  diagnosticos: DiagnosticoEntry[];
  recetas?: RecetaInput[];
  esContinuacion?: boolean;
  consultaOriginalId?: number;
  motivoContinuacion?: string;
}

export interface RecetaInput {
  medicamentoId: number;
  dosis: string;
  frecuencia: string;
  duracion?: string;
  cantidad: number;
  observaciones?: string;
}

@Injectable()
export class ConsultaService {
  private readonly logger = new Logger(ConsultaService.name);

  constructor(
    private readonly consultaRepository: ConsultaRepositoryPort,
    private readonly domainService: ConsultaDomainService,
    private readonly inmutabilidadService: InmutabilidadExpedienteService,
    private readonly pacienteRepository: PacienteRepositoryPort,
    private readonly medicoRepository: MedicoRepositoryPort,
    private readonly auditService: AuditService,
    @Inject(forwardRef(() => RecetaService))
    private readonly recetaService: RecetaService,
  ) {}

  async findAll(query: ConsultaQuery) {
    return this.consultaRepository.findAll(query);
  }

  /** Médico vinculado al usuario autenticado (el token identifica al usuario, no al médico). */
  async medicoIdDeUsuario(usuarioId: number): Promise<number> {
    const medico = await this.medicoRepository.findByUsuarioId(usuarioId);
    if (!medico?.id) {
      throw new ForbiddenException(
        'Su usuario no está vinculado a un médico. Solicite al administrador que lo vincule desde Configuración → Médicos.',
      );
    }
    return medico.id;
  }

  async findOne(id: number): Promise<ConsultaDomain> {
    const consulta = await this.consultaRepository.findByIdWithRelations(id, [
      'paciente',
      'medico',
      'medico.especialidad',
      'diagnosticos',
      'diagnosticos.cie10',
      'recetas',
      'recetas.items',
      'recetas.items.medicamento',
      'examenes',
    ]);
    if (!consulta)
      throw new NotFoundException(`Consulta con ID ${id} no encontrada`);
    return consulta;
  }

  async create(
    dto: {
      pacienteId: number;
      medicoId: number;
      motivo: string;
      sintomas: string;
    },
    medicoId: number,
  ): Promise<ConsultaDomain> {
    const errores = this.domainService.validarConsulta(
      dto.motivo,
      dto.sintomas,
      dto.pacienteId,
      dto.medicoId,
    );
    if (errores.length > 0) throw new BadRequestException(errores.join('; '));

    const consulta = new ConsultaDomain({
      pacienteId: dto.pacienteId,
      medicoId: dto.medicoId,
      motivo: dto.motivo,
      sintomas: dto.sintomas,
    });

    return this.consultaRepository.save(consulta);
  }

  async createConsultaCompleta(
    dto: CreateConsultaCompletaInput,
  ): Promise<ConsultaDomain> {
    const errores: string[] = [];

    const paciente = await this.pacienteRepository.findById(dto.pacienteId);
    if (!paciente) {
      throw new NotFoundException(
        `El paciente con ID ${dto.pacienteId} no existe. Verifique el padrón antes de registrar la consulta`,
      );
    }

    const medico = await this.medicoRepository.findById(dto.medicoId);
    if (!medico) {
      throw new NotFoundException(
        `El médico con ID ${dto.medicoId} no existe. Verifique el directorio de médicos`,
      );
    }

    errores.push(
      ...this.domainService.validarConsulta(
        dto.motivoConsulta || '',
        dto.sintomas || '',
        dto.pacienteId,
        dto.medicoId,
      ),
    );

    if (!dto.diagnosticos?.length) {
      errores.push(
        'Debe registrar al menos un diagnóstico CIE-10 para cerrar la consulta',
      );
    } else {
      const sinCie10 = dto.diagnosticos.some(
        (d) => !d.cie10Id && !d.codigoCie10,
      );
      if (sinCie10) {
        errores.push(
          'Cada diagnóstico debe seleccionarse del catálogo CIE-10 (código o ID obligatorio)',
        );
      }
      for (const diag of dto.diagnosticos) {
        errores.push(
          ...this.domainService.validarDiagnostico(diag.descripcion, diag.tipo),
        );
      }
    }

    const signos: SignosVitales = {
      presionArterialSistolica: dto.presionArterialSistolica,
      presionArterialDiastolica: dto.presionArterialDiastolica,
      frecuenciaCardiaca: dto.frecuenciaCardiaca,
      frecuenciaRespiratoria: dto.frecuenciaRespiratoria,
      temperatura: dto.temperatura,
      saturacionOxigeno: dto.saturacionOxigeno,
      glucosaCapilar: dto.glucosaCapilar,
      peso: dto.peso,
      talla: dto.talla,
    };
    errores.push(...this.domainService.validarSignosVitales(signos));

    if (dto.esContinuacion) {
      errores.push(
        ...this.domainService.validarContinuacion(
          dto.consultaOriginalId,
          dto.motivoContinuacion,
        ),
      );
    }

    if (errores.length > 0) throw new BadRequestException(errores.join('; '));

    const consulta = new ConsultaDomain({
      pacienteId: dto.pacienteId,
      medicoId: dto.medicoId,
      citaId: dto.citaId,
      motivo: dto.motivoConsulta || '',
      sintomas: dto.sintomas || '',
    });

    consulta.enfermedadActual = dto.enfermedadActual;
    consulta.examenFisico = dto.examenFisico;
    consulta.agregarSignosVitales(signos);
    consulta.agregarEvaluacion(
      dto.evaluacion || '',
      dto.planTratamiento || '',
      dto.indicaciones || '',
    );

    if (dto.diagnosticos) {
      for (const diag of dto.diagnosticos) {
        consulta.agregarDiagnostico(diag);
      }
    }

    if (dto.esContinuacion && dto.consultaOriginalId) {
      consulta.marcarComoContinuacion(
        dto.consultaOriginalId,
        dto.motivoContinuacion || '',
      );
    }

    const alertas = this.domainService.detectarSignosAlarma(signos);
    if (alertas.length > 0) {
      this.logger.warn(
        `[ALERTAS CLÍNICAS] Consulta paciente ${dto.pacienteId}: ${alertas.join(' | ')}`,
      );
    }

    const saved = await this.consultaRepository.save(consulta);

    // PLAN → receta médica: los medicamentos indicados en el SOAP se guardan
    // como receta de la consulta (medicamento, dosis, frecuencia, duración).
    if (dto.recetas && dto.recetas.length > 0 && saved.id) {
      await this.recetaService.create({
        consultaId: saved.id,
        instrucciones: dto.indicaciones,
        medicamentos: dto.recetas.map((r) => ({
          medicamentoId: r.medicamentoId,
          dosis: r.dosis,
          frecuencia: r.frecuencia,
          duracion: r.duracion,
          cantidad: r.cantidad,
          observaciones: r.observaciones,
        })),
      });
      return (
        (await this.consultaRepository.findByIdWithRelations(saved.id, [
          'diagnosticos',
          'diagnosticos.cie10',
          'recetas',
          'recetas.items',
          'recetas.items.medicamento',
        ])) ?? saved
      );
    }

    return saved;
  }

  async continuarConsulta(
    consultaOriginalId: number,
    medicoId: number,
    dto: Partial<CreateConsultaCompletaInput>,
  ): Promise<ConsultaDomain> {
    const original = await this.consultaRepository.findById(consultaOriginalId);
    if (!original)
      throw new NotFoundException(
        `Consulta original ${consultaOriginalId} no encontrada`,
      );

    const errores = this.domainService.validarContinuacion(
      consultaOriginalId,
      dto.motivoContinuacion,
    );
    if (errores.length > 0) throw new BadRequestException(errores.join('; '));

    const consulta = new ConsultaDomain({
      pacienteId: original.pacienteId,
      medicoId,
      motivo: dto.motivoConsulta || original.motivo,
      sintomas: dto.sintomas || original.sintomas,
    });

    consulta.enfermedadActual = dto.enfermedadActual;
    consulta.examenFisico = dto.examenFisico || original.examenFisico;
    consulta.agregarEvaluacion(
      dto.evaluacion || '',
      dto.planTratamiento || '',
      dto.indicaciones || '',
    );
    consulta.marcarComoContinuacion(
      consultaOriginalId,
      dto.motivoContinuacion || '',
    );

    if (dto.peso || dto.talla || dto.temperatura || dto.frecuenciaCardiaca) {
      consulta.agregarSignosVitales({
        presionArterialSistolica: dto.presionArterialSistolica,
        presionArterialDiastolica: dto.presionArterialDiastolica,
        frecuenciaCardiaca: dto.frecuenciaCardiaca,
        frecuenciaRespiratoria: dto.frecuenciaRespiratoria,
        temperatura: dto.temperatura,
        saturacionOxigeno: dto.saturacionOxigeno,
        glucosaCapilar: dto.glucosaCapilar,
        peso: dto.peso,
        talla: dto.talla,
      });
    }

    return this.consultaRepository.save(consulta);
  }

  async getPacienteTimeline(pacienteId: number): Promise<{
    pacienteId: number;
    totalConsultas: number;
    consultas: ConsultaDomain[];
    diagnosticosCronicos: DiagnosticoEntry[];
    ultimasRecetas: any[];
  }> {
    const consultas =
      await this.consultaRepository.findByPacienteId(pacienteId);
    return {
      pacienteId,
      totalConsultas: consultas.length,
      consultas,
      diagnosticosCronicos: consultas
        .flatMap((c) => c.diagnosticos)
        .filter((d) => d?.esCronico),
      ultimasRecetas: [],
    };
  }

  async getHistorialCompleto(pacienteId: number) {
    return this.consultaRepository.getHistorialCompleto(pacienteId);
  }

  async update(
    id: number,
    dto: Partial<
      import('../infrastructure/dto/create-consulta.dto').UpdateConsultaDto
    >,
    medicoId?: number,
  ): Promise<ConsultaDomain> {
    const consulta = await this.consultaRepository.findById(id);
    if (!consulta)
      throw new NotFoundException(`Consulta con ID ${id} no encontrada`);

    // Inmutabilidad: solo el autor puede enmendar dentro de 24h.
    // Lanza excepciones de dominio (ExpedienteInmutableException -> 409,
    // EnmiendaNoAutorizadaException -> 403) que el filtro global traduce a HTTP.
    if (medicoId) {
      this.inmutabilidadService.verificarEnmienda({
        consultaId: id,
        registradaEn: consulta.createdAt,
        autorMedicoId: consulta.medicoId,
        solicitanteMedicoId: medicoId,
        cambios: dto as Record<string, unknown>,
      });
    }

    if (dto.motivo || dto.sintomas) {
      const errores = this.domainService.validarConsulta(
        dto.motivo || consulta.motivo,
        dto.sintomas || consulta.sintomas,
        consulta.pacienteId,
        consulta.medicoId,
      );
      if (errores.length > 0) throw new BadRequestException(errores.join('; '));
    }

    const data: Partial<ConsultaDomain> = {
      motivo: dto.motivo,
      sintomas: dto.sintomas,
      enfermedadActual: dto.enfermedadActual,
      examenFisico: dto.examenFisico,
      evaluacion: dto.evaluacion,
      planTratamiento: dto.planTratamiento,
      indicaciones: dto.indicaciones,
    };

    const signosFields = [
      'peso',
      'talla',
      'temperatura',
      'frecuenciaCardiaca',
      'frecuenciaRespiratoria',
      'presionArterialSistolica',
      'presionArterialDiastolica',
      'saturacionOxigeno',
      'glucosaCapilar',
    ];
    const dtoRecord = dto as Record<string, unknown>;
    const hasSignos = signosFields.some((f) => dtoRecord[f] !== undefined);
    if (hasSignos) {
      data.signosVitales = {
        peso: dto.peso ?? consulta.signosVitales.peso,
        talla: dto.talla ?? consulta.signosVitales.talla,
        temperatura: dto.temperatura ?? consulta.signosVitales.temperatura,
        frecuenciaCardiaca:
          dto.frecuenciaCardiaca ?? consulta.signosVitales.frecuenciaCardiaca,
        frecuenciaRespiratoria:
          dto.frecuenciaRespiratoria ??
          consulta.signosVitales.frecuenciaRespiratoria,
        presionArterialSistolica:
          dto.presionArterialSistolica ??
          consulta.signosVitales.presionArterialSistolica,
        presionArterialDiastolica:
          dto.presionArterialDiastolica ??
          consulta.signosVitales.presionArterialDiastolica,
        saturacionOxigeno:
          dto.saturacionOxigeno ?? consulta.signosVitales.saturacionOxigeno,
        glucosaCapilar:
          dto.glucosaCapilar ?? consulta.signosVitales.glucosaCapilar,
      };
    }

    const updated = await this.consultaRepository.update(id, data);

    // Auditoría de la enmienda admitida: valor anterior y nuevo (B6 / R.M. 0090).
    const originalAsistencial = {
      motivo: consulta.motivo,
      sintomas: consulta.sintomas,
      enfermedadActual: consulta.enfermedadActual,
      examenFisico: consulta.examenFisico,
      evaluacion: consulta.evaluacion,
      planTratamiento: consulta.planTratamiento,
      indicaciones: consulta.indicaciones,
    };
    const { antes, despues } = this.inmutabilidadService.diferencias(
      originalAsistencial,
      dto as Record<string, unknown>,
    );
    if (Object.keys(antes).length > 0) {
      await this.auditService.log({
        userId: medicoId ? String(medicoId) : 'unknown',
        action: AuditAction.UPDATE,
        entityType: 'consulta',
        entityId: String(id),
        oldValue: antes,
        newValue: despues,
        reason: 'Enmienda al expediente clínico dentro de la ventana legal',
      });
    }

    return updated;
  }

  /**
   * Registra una nota de evolucion / enmienda sobre una consulta existente.
   * Es el mecanismo legal (Ley 3131, R.M. 0090) para documentar correcciones
   * cuando ya no es posible modificar el texto original.
   */
  async agregarNota(
    consultaId: number,
    creadoPorId: number,
    contenido: string,
    tipo?: string,
  ): Promise<any> {
    const consulta = await this.consultaRepository.findById(consultaId);
    if (!consulta)
      throw new NotFoundException(
        `La consulta con ID ${consultaId} no existe. No se puede registrar la nota de enmienda`,
      );

    if (!contenido?.trim()) {
      throw new BadRequestException(
        'El contenido de la nota de enmienda no puede estar vacío',
      );
    }

    const tipoFinal = tipo || TipoNotaEvolucion.NOTA_MEDICA;
    const nota = await this.consultaRepository.agregarNota({
      consultaId,
      creadoPorId,
      contenido,
      tipo: tipoFinal,
    });

    await this.auditService.log({
      userId: String(creadoPorId),
      action: AuditAction.UPDATE,
      entityType: 'consulta',
      entityId: String(consultaId),
      newValue: { contenido, tipo: tipoFinal },
      reason: 'Nota de enmienda al expediente clínico (R.M. 0090)',
    });

    return nota;
  }
}
