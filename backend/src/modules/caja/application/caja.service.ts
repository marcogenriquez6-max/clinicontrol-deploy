import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CajaRepositoryPort } from '../domain/ports/caja-repository.port';
import { CajaSessionDomain } from '../domain/caja.domain';
import { TurnoService } from '../../turno/application/turno.service';

@Injectable()
export class CajaService {
  constructor(
    private readonly cajaRepo: CajaRepositoryPort,
    private readonly turnoService: TurnoService,
  ) {}

  async findAll(): Promise<CajaSessionDomain[]> {
    return this.cajaRepo.findAll('DESC');
  }

  async findOne(id: number): Promise<CajaSessionDomain> {
    const session = await this.cajaRepo.findById(id);
    if (!session)
      throw new NotFoundException(`Sesión de caja ${id} no encontrada`);
    return session;
  }

  async findSesionAbierta(): Promise<CajaSessionDomain | null> {
    return this.cajaRepo.findSesionAbierta();
  }

  async getSesionActual(): Promise<CajaSessionDomain | null> {
    return this.cajaRepo.findSesionAbierta();
  }

  async abrirSesion(
    montoInicial: number,
    usuarioId: number,
  ): Promise<CajaSessionDomain> {
    const abierta = await this.cajaRepo.findSesionAbierta();
    if (abierta)
      throw new BadRequestException('Ya hay una sesión de caja abierta');
    return this.cajaRepo.create({
      fechaApertura: new Date(),
      montoInicial,
      estado: 'abierta',
      usuarioId,
    });
  }

  async cerrarSesion(
    id: number,
    montoFinal: number,
    observaciones?: string,
  ): Promise<CajaSessionDomain> {
    const session = await this.findOne(id);
    if (session.estado === 'cerrada')
      throw new BadRequestException('La sesión ya está cerrada');
    session.cerrar(montoFinal, observaciones);
    await this.cajaRepo.update(id, {
      estado: session.estado,
      fechaCierre: session.fechaCierre,
      montoFinal: session.montoFinal,
      observaciones: session.observaciones,
    });
    return session;
  }

  async cobrar(
    montoRecibido: number,
  ): Promise<{ valido: boolean; vuelto: number; mensaje: string }> {
    const sesionAbierta = await this.cajaRepo.findSesionAbierta();
    if (!sesionAbierta) {
      return {
        valido: false,
        vuelto: 0,
        mensaje: 'No hay una sesión de caja abierta',
      };
    }
    return sesionAbierta.cobrar(montoRecibido);
  }

  async getTurnosPendientes(): Promise<any[]> {
    const sesionAbierta = await this.cajaRepo.findSesionAbierta();
    if (!sesionAbierta) return [];

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const turnosPagados = await this.turnoService.findAll({
      pacienteId: undefined,
      estado: 'pagado',
    });

    const turnosPendientes = turnosPagados.data.filter((t) => {
      if (!t.fechaProgramada) return false;
      const fechaT = new Date(t.fechaProgramada);
      fechaT.setHours(0, 0, 0, 0);
      return fechaT.getTime() === hoy.getTime() && !t.pagado;
    });

    return turnosPendientes;
  }

  async getArqueoHoy(): Promise<any> {
    const turnosPendientes = await this.getTurnosPendientes();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const metodos: Record<string, number> = {};
    const total = 0;

    // Los turnos pagados de hoy ya fueron contabilizados en el KPI
    // Aquí contamos por método de pago desde el arqueo anterior
    // Simplificación: retornamos datos básicos

    const sesionActual = await this.getSesionActual();
    const montoInicial = sesionActual?.montoInicial ?? 0;
    const montoFinal = sesionActual?.montoFinal ?? 0;
    const vuelto = montoFinal - montoInicial;

    return {
      montoInicial,
      montoFinal,
      total,
      vuelto,
      metodoPago: Object.keys(metodos),
    };
  }

  async cerrarCaja(): Promise<{ valido: boolean; mensaje: string }> {
    const sesionAbierta = await this.cajaRepo.findSesionAbierta();
    if (!sesionAbierta) {
      return { valido: false, mensaje: 'No hay una sesión de caja abierta' };
    }
    if (sesionAbierta.estado === 'cerrada') {
      return {
        valido: false,
        mensaje: 'La caja del día ya fue cerrada. Contacte a administración.',
      };
    }

    sesionAbierta.cerrar(sesionAbierta.montoFinal!, undefined);
    await this.cajaRepo.update(sesionAbierta.id, {
      estado: sesionAbierta.estado,
      fechaCierre: sesionAbierta.fechaCierre,
      montoFinal: sesionAbierta.montoFinal,
      observaciones: sesionAbierta.observaciones,
    });

    return {
      valido: true,
      mensaje: `Caja cerrada — total Bs ${sesionAbierta.montoFinal?.toFixed(2) || '0.00'}`,
    };
  }
}
