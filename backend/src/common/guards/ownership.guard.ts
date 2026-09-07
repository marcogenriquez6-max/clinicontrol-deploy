import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { OWNERSHIP_KEY } from '../decorators/ownership.decorator';
import { Medico } from '../../entities/medico.entity';
import { Consulta } from '../../entities/consulta.entity';
import { Cita } from '../../entities/cita.entity';
import { Receta } from '../../entities/receta-medicamento.entity';
import { Turno } from '../../entities/turno.entity';
import { Hospitalizacion } from '../../entities/hospitalizacion.entity';

export interface OwnershipStrategy {
  checkOwnership(
    userId: number,
    rol: string,
    params: Record<string, string>,
    em: EntityManager,
  ): Promise<boolean>;
}

const READ_ONLY_ROLES = ['gerente', 'secretaria', 'recepcionista'];

@Injectable()
export class OwnershipGuard implements CanActivate {
  private readonly logger = new Logger(OwnershipGuard.name);
  private readonly strategies = new Map<string, OwnershipStrategy>();

  constructor(
    private readonly reflector: Reflector,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    this.strategies.set('patient', new PatientOwnershipStrategy());
    this.strategies.set('appointment', new AppointmentOwnershipStrategy());
    this.strategies.set('consultation', new ConsultationOwnershipStrategy());
    this.strategies.set('prescription', new PrescriptionOwnershipStrategy());
    this.strategies.set('record', new RecordOwnershipStrategy());
  }

  registerStrategy(resourceType: string, strategy: OwnershipStrategy) {
    this.strategies.set(resourceType, strategy);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceType = this.reflector.getAllAndOverride<string>(
      OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!resourceType) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('No autenticado');

    const strategy = this.strategies.get(resourceType);
    if (!strategy) return true;

    return strategy.checkOwnership(
      user.id,
      user.rol,
      request.params,
      this.entityManager,
    );
  }
}

async function getMedicoId(
  userId: number,
  em: EntityManager,
): Promise<number | null> {
  const medico = await em.getRepository(Medico).findOne({
    where: { usuarioId: userId },
    select: { id: true } as any,
  });
  return medico?.id ?? null;
}

/**
 * Un médico "pertenece" al expediente de un paciente cuando existe una relación
 * asistencial entre ambos: una consulta previa, un turno o una cita asignada,
 * o una hospitalización como médico tratante. Así el médico puede abrir la
 * historia clínica del paciente que llega a su Agenda del Día antes de la
 * primera consulta, sin abrir el expediente a médicos ajenos (Ley 3131).
 */
async function checkMedicoBelongsToPaciente(
  userId: number,
  pacienteId: number,
  em: EntityManager,
): Promise<boolean> {
  const medicoId = await getMedicoId(userId, em);
  if (!medicoId) return false;
  const [consultas, turnos, citas, hospitalizaciones] = await Promise.all([
    em.getRepository(Consulta).count({
      where: { medico: { id: medicoId }, paciente: { id: pacienteId } },
    }),
    em.getRepository(Turno).count({
      where: { medicoId, pacienteId },
    }),
    em.getRepository(Cita).count({
      where: { medico: { id: medicoId }, paciente: { id: pacienteId } },
    }),
    em.getRepository(Hospitalizacion).count({
      where: { medicoTratanteId: medicoId, pacienteId },
    }),
  ]);
  return consultas + turnos + citas + hospitalizaciones > 0;
}

class PatientOwnershipStrategy implements OwnershipStrategy {
  async checkOwnership(
    userId: number,
    rol: string,
    params: Record<string, string>,
    em: EntityManager,
  ): Promise<boolean> {
    const pacienteId = Number(params.pacienteId || params.id);
    if (!pacienteId || Number.isNaN(pacienteId)) {
      throw new BadRequestException('ID de paciente inválido');
    }
    if (READ_ONLY_ROLES.includes(rol)) return true;
    if (rol === 'admin') return true;
    // Enfermería registra triaje y evoluciones de cualquier paciente en espera o internado.
    if (rol === 'enfermeria') return true;
    if (rol === 'medico') {
      if (!(await checkMedicoBelongsToPaciente(userId, pacienteId, em))) {
        throw new ForbiddenException(
          'No tiene permisos para acceder a este recurso',
        );
      }
      return true;
    }
    throw new ForbiddenException(
      'No tiene permisos para acceder a este recurso',
    );
  }
}

class AppointmentOwnershipStrategy implements OwnershipStrategy {
  async checkOwnership(
    userId: number,
    rol: string,
    params: Record<string, string>,
    em: EntityManager,
  ): Promise<boolean> {
    const citaId = Number(params.id);
    if (!citaId || Number.isNaN(citaId)) {
      throw new BadRequestException('ID de cita inválido');
    }
    if (READ_ONLY_ROLES.includes(rol)) return true;
    if (rol === 'admin') return true;
    if (rol === 'medico') {
      const medicoId = await getMedicoId(userId, em);
      if (!medicoId) throw new ForbiddenException('No tiene permisos');
      const count = await em.getRepository(Cita).count({
        where: { id: citaId, medico: { id: medicoId } },
      });
      if (count === 0) throw new ForbiddenException('No tiene permisos');
      return true;
    }
    if (rol === 'enfermeria') return true;
    throw new ForbiddenException('No tiene permisos');
  }
}

class ConsultationOwnershipStrategy implements OwnershipStrategy {
  async checkOwnership(
    userId: number,
    rol: string,
    params: Record<string, string>,
    em: EntityManager,
  ): Promise<boolean> {
    const consultaId = Number(params.id);
    if (!consultaId || Number.isNaN(consultaId)) {
      throw new BadRequestException('ID de consulta inválido');
    }
    if (READ_ONLY_ROLES.includes(rol)) return true;
    if (rol === 'admin') return true;
    if (rol === 'medico' || rol === 'enfermeria') {
      const medicoId = await getMedicoId(userId, em);
      if (!medicoId) throw new ForbiddenException('No tiene permisos');
      const count = await em.getRepository(Consulta).count({
        where: { id: consultaId, medico: { id: medicoId } },
      });
      if (count === 0) throw new ForbiddenException('No tiene permisos');
      return true;
    }
    throw new ForbiddenException('No tiene permisos');
  }
}

class PrescriptionOwnershipStrategy implements OwnershipStrategy {
  async checkOwnership(
    userId: number,
    rol: string,
    params: Record<string, string>,
    em: EntityManager,
  ): Promise<boolean> {
    const recetaId = Number(params.id);
    if (!recetaId || Number.isNaN(recetaId)) {
      throw new BadRequestException('ID de receta inválido');
    }
    if (READ_ONLY_ROLES.includes(rol)) return true;
    if (rol === 'admin') return true;
    if (rol === 'medico') {
      const medicoId = await getMedicoId(userId, em);
      if (!medicoId) throw new ForbiddenException('No tiene permisos');
      const consultaRepo = em.getRepository(Consulta);
      const receta = await em.getRepository(Receta).findOne({
        where: { id: recetaId },
        relations: ['consulta'],
      });
      if (!receta) throw new ForbiddenException('Receta no encontrada');
      const count = await consultaRepo.count({
        where: { id: receta.consultaId, medico: { id: medicoId } },
      });
      if (count === 0) throw new ForbiddenException('No tiene permisos');
      return true;
    }
    throw new ForbiddenException('No tiene permisos');
  }
}

class RecordOwnershipStrategy implements OwnershipStrategy {
  async checkOwnership(
    userId: number,
    rol: string,
    params: Record<string, string>,
    em: EntityManager,
  ): Promise<boolean> {
    const pacienteId = Number(params.pacienteId || params.id);
    if (!pacienteId || Number.isNaN(pacienteId)) {
      throw new BadRequestException('ID de paciente inválido');
    }
    if (READ_ONLY_ROLES.includes(rol)) return true;
    if (rol === 'admin') return true;
    if (rol === 'enfermeria') return true;
    if (rol === 'medico') {
      if (!(await checkMedicoBelongsToPaciente(userId, pacienteId, em))) {
        throw new ForbiddenException(
          'No tiene permisos para acceder a este historial',
        );
      }
      return true;
    }
    throw new ForbiddenException('No tiene permisos');
  }
}
