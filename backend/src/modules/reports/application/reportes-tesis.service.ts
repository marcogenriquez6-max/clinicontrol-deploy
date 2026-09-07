import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Between, EntityManager, In } from 'typeorm';
import { Paciente } from '../../../entities/paciente.entity';
import { Cita } from '../../../entities/cita.entity';
import { Consulta } from '../../../entities/consulta.entity';
import { Receta } from '../../../entities/receta-medicamento.entity';
import { Medico } from '../../../entities/medico.entity';
import { Turno } from '../../../entities/turno.entity';
import { Triage } from '../../../entities/triage.entity';
import {
  Hospitalizacion,
  Cama,
  AdmisionEstado,
  BedStatus,
} from '../../../entities/hospitalizacion.entity';
import { Pago } from '../../../entities/pago.entity';
import { AuditLog, AuditAction } from '../../../entities/audit-log.entity';
import { Usuario } from '../../../entities/usuario.entity';
import { AuditService } from '../../../common/services/audit.service';

export interface Periodo {
  fechaInicio?: string;
  fechaFin?: string;
}

function rango(p: Periodo): { inicio: Date; fin: Date } {
  const hoy = new Date();
  const inicio = p.fechaInicio
    ? new Date(`${p.fechaInicio}T00:00:00`)
    : new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const fin = p.fechaFin ? new Date(`${p.fechaFin}T23:59:59.999`) : new Date();
  fin.setHours(23, 59, 59, 999);
  inicio.setHours(0, 0, 0, 0);
  return { inicio, fin };
}

function rangoHoy() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date();
  fin.setHours(23, 59, 59, 999);
  return { inicio, fin };
}

const nombreDe = (p?: { nombre?: string; apellido?: string } | null) =>
  p ? `${p.nombre ?? ''} ${p.apellido ?? ''}`.trim() : '';

/**
 * Reportes imprimibles por rol, tal como los describe el documento de grado.
 * Devuelven JSON; la impresión se resuelve en el navegador.
 */
@Injectable()
export class ReportesTesisService {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly auditService: AuditService,
  ) {}

  private repo<T extends object>(entity: new () => T) {
    return this.em.getRepository<T>(entity);
  }

  // ───────────────────────── RECEPCIÓN ─────────────────────────
  async recepcion(periodo: Periodo) {
    const { inicio, fin } = rango(periodo);
    const [pacientes, citas, turnos, pagos] = await Promise.all([
      this.repo(Paciente).find({
        where: { createdAt: Between(inicio, fin) },
        relations: ['genero'],
        order: { createdAt: 'ASC' },
      }),
      this.repo(Cita).find({
        where: { fecha: Between(inicio, fin) },
        relations: ['paciente', 'medico', 'estado'],
        order: { fecha: 'ASC' },
      }),
      this.repo(Turno).find({
        where: { createdAt: Between(inicio, fin) },
        relations: ['paciente', 'medico'],
        order: { createdAt: 'ASC' },
      }),
      this.repo(Pago).find({
        where: { fecha: Between(inicio, fin) },
        relations: ['paciente'],
        order: { fecha: 'ASC' },
      }),
    ]);
    const pagados = pagos.filter((p) => p.estado === 'pagado');
    return {
      periodo: { desde: inicio, hasta: fin },
      pacientesRegistrados: {
        total: pacientes.length,
        lista: pacientes.map((p) => ({
          fecha: p.createdAt,
          ci: p.ci,
          nombre: nombreDe(p),
          genero: p.genero?.nombre ?? '',
          telefono: p.telefono ?? '',
        })),
      },
      citasProgramadas: {
        total: citas.length,
        lista: citas.map((c) => ({
          fecha: c.fecha,
          hora: c.horaInicio,
          paciente: nombreDe(c.paciente),
          medico: nombreDe(c.medico),
          estado: c.estado?.nombre ?? '',
        })),
      },
      turnosEmitidos: {
        total: turnos.length,
        lista: turnos.map((t) => ({
          fecha: t.createdAt,
          turno: `${t.prefijo ?? 'A'}${String(t.numero).padStart(3, '0')}`,
          paciente: nombreDe(t.paciente),
          medico: nombreDe(t.medico),
          estado: t.estado,
          pagado: t.pagado,
        })),
      },
      pagosRegistrados: {
        total: pagados.length,
        montoTotal: pagados.reduce((s, p) => s + Number(p.monto), 0),
        anulados: pagos.length - pagados.length,
        lista: pagos.map((p) => ({
          fecha: p.fecha,
          recibo: p.numeroRecibo,
          paciente: nombreDe(p.paciente),
          concepto: p.concepto,
          monto: Number(p.monto),
          estado: p.estado,
        })),
      },
    };
  }

  // ───────────────────────── ENFERMERÍA ─────────────────────────
  async triaje(periodo: Periodo) {
    const { inicio, fin } = rango(periodo);
    const triajes = await this.repo(Triage).find({
      where: { fechaHora: Between(inicio, fin), activo: true },
      relations: ['paciente', 'realizadoPor'],
      order: { fechaHora: 'ASC' },
    });
    const porNivel = [1, 2, 3, 4, 5].map((n) => ({
      nivel: n,
      total: triajes.filter((t) => t.esiNivel === n).length,
    }));
    const atendidos = triajes.filter((t) => t.estado === 'completado');
    return {
      periodo: { desde: inicio, hasta: fin },
      total: triajes.length,
      porNivel,
      atendidos: atendidos.length,
      lista: triajes.map((t) => ({
        fecha: t.fechaHora,
        paciente: nombreDe(t.paciente),
        ci: t.paciente?.ci ?? '',
        esi: t.esiNivel,
        temperatura: t.temperatura,
        presionArterial: t.presionArterial,
        frecuenciaCardiaca: t.frecuenciaCardiaca,
        saturacion: t.saturacionOxigeno,
        peso: t.peso,
        talla: t.talla,
        estado: t.estado,
        enfermera: nombreDe(t.realizadoPor),
      })),
    };
  }

  // ───────────────────────── MÉDICO ─────────────────────────
  async medico(periodo: Periodo, medicoId?: number) {
    const { inicio, fin } = rango(periodo);
    const where: Record<string, unknown> = { fecha: Between(inicio, fin) };
    if (medicoId) where.medicoId = medicoId;
    const consultas = await this.repo(Consulta).find({
      where,
      relations: [
        'paciente',
        'medico',
        'diagnosticos',
        'diagnosticos.cie10',
        'recetas',
        'recetas.items',
        'recetas.items.medicamento',
      ],
      order: { fecha: 'ASC' },
    });

    const freq: Record<string, { codigo: string; descripcion: string; total: number }> = {};
    const recetas: Array<Record<string, unknown>> = [];
    for (const c of consultas) {
      for (const d of c.diagnosticos ?? []) {
        const codigo = d.cie10?.codigo;
        if (!codigo) continue;
        freq[codigo] ??= {
          codigo,
          descripcion: d.cie10?.descripcion ?? '',
          total: 0,
        };
        freq[codigo].total++;
      }
      for (const r of c.recetas ?? []) {
        recetas.push({
          fecha: c.fecha,
          paciente: nombreDe(c.paciente),
          medico: nombreDe(c.medico),
          medicamentos: (r.items ?? [])
            .map((i) => i.medicamento?.nombre ?? '')
            .filter(Boolean)
            .join(', '),
          estado: r.estado,
        });
      }
    }

    return {
      periodo: { desde: inicio, hasta: fin },
      consultas: {
        total: consultas.length,
        lista: consultas.map((c) => ({
          fecha: c.fecha,
          paciente: nombreDe(c.paciente),
          ci: c.paciente?.ci ?? '',
          medico: nombreDe(c.medico),
          motivo: c.motivo ?? '',
          diagnosticos: (c.diagnosticos ?? [])
            .map((d) => d.cie10?.codigo)
            .filter(Boolean)
            .join(', '),
        })),
      },
      diagnosticosFrecuentes: Object.values(freq).sort((a, b) => b.total - a.total),
      recetas: { total: recetas.length, lista: recetas },
    };
  }

  /** Médico vinculado a un usuario (para acotar sus reportes). */
  async medicoIdDeUsuario(usuarioId: number): Promise<number | undefined> {
    const m = await this.repo(Medico).findOne({ where: { usuarioId } });
    return m?.id;
  }

  // ───────────────────────── HOSPITALIZACIÓN ─────────────────────────
  async hospitalizacion(periodo: Periodo) {
    const { inicio, fin } = rango(periodo);
    const [activas, altas, camas] = await Promise.all([
      this.repo(Hospitalizacion).find({
        where: { activo: true, estado: In([
          AdmisionEstado.ADMITIDO,
          AdmisionEstado.EN_OBSERVACION,
          AdmisionEstado.INTERNADO,
        ]) },
        relations: ['paciente', 'medicoTratante', 'cama'],
        order: { fechaIngreso: 'ASC' },
      }),
      this.repo(Hospitalizacion).find({
        where: { estado: AdmisionEstado.ALTA, fechaAlta: Between(inicio, fin) },
        relations: ['paciente', 'medicoTratante', 'cama'],
        order: { fechaAlta: 'ASC' },
      }),
      this.repo(Cama).find({ where: { activo: true }, order: { codigoCama: 'ASC' } }),
    ]);
    const ocupadas = camas.filter((c) => c.estado === BedStatus.OCUPADO);
    return {
      periodo: { desde: inicio, hasta: fin },
      internados: {
        total: activas.length,
        lista: activas.map((h) => ({
          fechaIngreso: h.fechaIngreso,
          paciente: nombreDe(h.paciente),
          ci: h.paciente?.ci ?? '',
          cama: h.cama?.codigoCama ?? '',
          servicio: h.cama?.servicio ?? '',
          medico: nombreDe(h.medicoTratante),
          diagnostico: h.diagnosticoIngreso ?? h.motivoIngreso ?? '',
          estado: h.estado,
        })),
      },
      camas: {
        total: camas.length,
        ocupadas: ocupadas.length,
        disponibles: camas.filter((c) => c.estado === BedStatus.DISPONIBLE).length,
        porcentajeOcupacion: camas.length
          ? Math.round((ocupadas.length / camas.length) * 100)
          : 0,
        lista: camas.map((c) => ({
          codigo: c.codigoCama,
          servicio: c.servicio,
          piso: c.piso ?? '',
          estado: c.estado,
        })),
      },
      altas: {
        total: altas.length,
        lista: altas.map((h) => ({
          fechaIngreso: h.fechaIngreso,
          fechaAlta: h.fechaAlta,
          paciente: nombreDe(h.paciente),
          medico: nombreDe(h.medicoTratante),
          diagnosticoAlta: h.diagnosticoAlta ?? '',
          dias: h.fechaAlta
            ? Math.max(
                1,
                Math.round(
                  (new Date(h.fechaAlta).getTime() - new Date(h.fechaIngreso).getTime()) /
                    86400000,
                ),
              )
            : 0,
        })),
      },
    };
  }

  // ───────────────────────── GERENCIA ─────────────────────────
  async indicadores() {
    const { inicio, fin } = rangoHoy();
    const [pacientesHoy, consultasHoy, triajesHoy, hospitalizados, camas, pagosHoy, citasHoy, turnosHoy, totalPacientes] =
      await Promise.all([
        this.repo(Paciente).count({ where: { createdAt: Between(inicio, fin) } }),
        this.repo(Consulta).count({ where: { fecha: Between(inicio, fin) } }),
        this.repo(Triage).count({ where: { fechaHora: Between(inicio, fin), activo: true } }),
        this.repo(Hospitalizacion).count({
          where: {
            activo: true,
            estado: In([AdmisionEstado.ADMITIDO, AdmisionEstado.EN_OBSERVACION, AdmisionEstado.INTERNADO]),
          },
        }),
        this.repo(Cama).find({ where: { activo: true } }),
        this.repo(Pago).find({ where: { fecha: Between(inicio, fin), estado: 'pagado' } }),
        this.repo(Cita).count({ where: { fecha: Between(inicio, fin) } }),
        this.repo(Turno).count({ where: { createdAt: Between(inicio, fin) } }),
        this.repo(Paciente).count({ where: { activo: true } }),
      ]);
    const ocupadas = camas.filter((c) => c.estado === BedStatus.OCUPADO).length;
    return {
      fecha: new Date(),
      pacientesDelDia: pacientesHoy,
      totalPacientes,
      consultasRealizadas: consultasHoy,
      triajesRealizados: triajesHoy,
      hospitalizados,
      citasHoy,
      turnosHoy,
      pagosHoy: {
        cantidad: pagosHoy.length,
        total: pagosHoy.reduce((s, p) => s + Number(p.monto), 0),
      },
      camas: {
        total: camas.length,
        ocupadas,
        disponibles: camas.filter((c) => c.estado === BedStatus.DISPONIBLE).length,
        porcentajeOcupacion: camas.length ? Math.round((ocupadas / camas.length) * 100) : 0,
      },
    };
  }

  async estadisticas(periodo: Periodo) {
    const { inicio, fin } = rango(periodo);
    const [consultas, citas, triajes, pacientesNuevos] = await Promise.all([
      this.repo(Consulta).find({
        where: { fecha: Between(inicio, fin) },
        relations: ['medico', 'medico.especialidad', 'diagnosticos', 'diagnosticos.cie10'],
      }),
      this.repo(Cita).find({ where: { fecha: Between(inicio, fin) }, relations: ['estado'] }),
      this.repo(Triage).find({ where: { fechaHora: Between(inicio, fin), activo: true } }),
      this.repo(Paciente).count({ where: { createdAt: Between(inicio, fin) } }),
    ]);

    // Serie diaria de consultas
    const porDia: Record<string, number> = {};
    for (const c of consultas) {
      const raw = c.fecha as unknown as string | Date;
      const k =
        typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)
          ? raw.slice(0, 10)
          : (() => {
              const f = new Date(raw);
              return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
            })();
      porDia[k] = (porDia[k] ?? 0) + 1;
    }
    const porEspecialidad: Record<string, number> = {};
    const porMedico: Record<string, number> = {};
    const diag: Record<string, { codigo: string; descripcion: string; total: number }> = {};
    for (const c of consultas) {
      const esp = c.medico?.especialidad?.nombre ?? 'Sin especialidad';
      porEspecialidad[esp] = (porEspecialidad[esp] ?? 0) + 1;
      const med = nombreDe(c.medico) || `Médico ${c.medicoId}`;
      porMedico[med] = (porMedico[med] ?? 0) + 1;
      for (const d of c.diagnosticos ?? []) {
        const codigo = d.cie10?.codigo;
        if (!codigo) continue;
        diag[codigo] ??= { codigo, descripcion: d.cie10?.descripcion ?? '', total: 0 };
        diag[codigo].total++;
      }
    }
    const citasPorEstado: Record<string, number> = {};
    for (const c of citas) {
      const e = c.estado?.nombre ?? 'sin estado';
      citasPorEstado[e] = (citasPorEstado[e] ?? 0) + 1;
    }
    return {
      periodo: { desde: inicio, hasta: fin },
      totales: {
        consultas: consultas.length,
        citas: citas.length,
        triajes: triajes.length,
        pacientesNuevos,
      },
      consultasPorDia: Object.entries(porDia)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([fecha, total]) => ({ fecha, total })),
      consultasPorEspecialidad: Object.entries(porEspecialidad).map(([nombre, total]) => ({ nombre, total })),
      consultasPorMedico: Object.entries(porMedico)
        .map(([nombre, total]) => ({ nombre, total }))
        .sort((a, b) => b.total - a.total),
      citasPorEstado: Object.entries(citasPorEstado).map(([nombre, total]) => ({ nombre, total })),
      triajesPorNivel: [1, 2, 3, 4, 5].map((n) => ({
        nivel: n,
        total: triajes.filter((t) => t.esiNivel === n).length,
      })),
      diagnosticosTop: Object.values(diag).sort((a, b) => b.total - a.total).slice(0, 10),
    };
  }

  async pacientes(periodo: Periodo) {
    const { inicio, fin } = rango(periodo);
    const [todos, nuevos] = await Promise.all([
      this.repo(Paciente).find({ relations: ['genero'], order: { apellido: 'ASC', nombre: 'ASC' } }),
      this.repo(Paciente).find({
        where: { createdAt: Between(inicio, fin) },
        relations: ['genero'],
        order: { createdAt: 'ASC' },
      }),
    ]);
    const activos = todos.filter((p) => p.activo);
    return {
      periodo: { desde: inicio, hasta: fin },
      registrados: todos.length,
      nuevos: nuevos.length,
      activos: activos.length,
      inactivos: todos.length - activos.length,
      listaNuevos: nuevos.map((p) => ({
        fecha: p.createdAt,
        ci: p.ci,
        nombre: nombreDe(p),
        genero: p.genero?.nombre ?? '',
        telefono: p.telefono ?? '',
      })),
      lista: activos.map((p) => ({
        ci: p.ci,
        nombre: nombreDe(p),
        genero: p.genero?.nombre ?? '',
        telefono: p.telefono ?? '',
        registrado: p.createdAt,
      })),
    };
  }

  async citas(periodo: Periodo) {
    const { inicio, fin } = rango(periodo);
    const citas = await this.repo(Cita).find({
      where: { fecha: Between(inicio, fin) },
      relations: ['paciente', 'medico', 'estado'],
      order: { fecha: 'ASC' },
    });
    const estado = (c: Cita) => (c.estado?.nombre ?? '').toLowerCase();
    const atendidas = citas.filter((c) => ['completada', 'en_curso'].includes(estado(c)));
    const canceladas = citas.filter((c) => estado(c) === 'cancelada');
    return {
      periodo: { desde: inicio, hasta: fin },
      programadas: citas.length,
      atendidas: atendidas.length,
      canceladas: canceladas.length,
      pendientes: citas.length - atendidas.length - canceladas.length,
      lista: citas.map((c) => ({
        fecha: c.fecha,
        hora: c.horaInicio,
        paciente: nombreDe(c.paciente),
        medico: nombreDe(c.medico),
        estado: c.estado?.nombre ?? '',
        motivoCancelacion: c.cancelacionMotivo ?? '',
      })),
    };
  }

  async productividad(periodo: Periodo) {
    const { inicio, fin } = rango(periodo);
    const [medicos, consultas] = await Promise.all([
      this.repo(Medico).find({ relations: ['especialidad'] }),
      this.repo(Consulta).find({
        where: { fecha: Between(inicio, fin) },
        relations: ['recetas', 'diagnosticos'],
      }),
    ]);
    const dias = Math.max(1, Math.round((fin.getTime() - inicio.getTime()) / 86400000));
    const lista = medicos.map((m) => {
      const propias = consultas.filter((c) => c.medicoId === m.id);
      return {
        medico: nombreDe(m),
        especialidad: m.especialidad?.nombre ?? '',
        consultas: propias.length,
        recetas: propias.reduce((s, c) => s + (c.recetas?.length ?? 0), 0),
        diagnosticos: propias.reduce((s, c) => s + (c.diagnosticos?.length ?? 0), 0),
        promedioDiario: Number((propias.length / dias).toFixed(2)),
      };
    });
    return {
      periodo: { desde: inicio, hasta: fin },
      totalConsultas: consultas.length,
      lista: lista.sort((a, b) => b.consultas - a.consultas),
    };
  }

  // ───────────────────────── AUDITORÍA ─────────────────────────
  async auditoria(periodo: Periodo, tipo: 'general' | 'usuario' | 'accesos', userId?: string) {
    const { inicio, fin } = rango(periodo);
    const where: Record<string, unknown> = { createdAt: Between(inicio, fin) };
    if (tipo === 'accesos') {
      where.action = In([AuditAction.LOGIN, AuditAction.LOGOUT, AuditAction.LOGIN_FAILED]);
    }
    if (tipo === 'usuario' && userId) where.userId = userId;
    const logs = await this.repo(AuditLog).find({
      where,
      order: { createdAt: 'DESC' },
      take: 2000,
    });
    const ids = [...new Set(logs.map((l) => Number(l.userId)).filter((n) => !isNaN(n) && n > 0))];
    const usuarios = ids.length
      ? await this.repo(Usuario).find({ where: { id: In(ids) }, relations: ['rol'] })
      : [];
    const mapa = new Map(usuarios.map((u) => [String(u.id), u]));
    const porUsuario: Record<string, number> = {};
    const porAccion: Record<string, number> = {};
    const lista = logs.map((l) => {
      const u = mapa.get(l.userId);
      const usuario = u ? nombreDe(u) : (l.userEmail ?? l.userId ?? '');
      porUsuario[usuario] = (porUsuario[usuario] ?? 0) + 1;
      porAccion[l.action] = (porAccion[l.action] ?? 0) + 1;
      return {
        fecha: l.createdAt,
        usuario,
        rol: u?.rol?.nombre ?? '',
        accion: l.action,
        modulo: l.entityType,
        registro: l.entityId,
        ip: l.ipAddress ?? '',
      };
    });
    return {
      periodo: { desde: inicio, hasta: fin },
      tipo,
      total: lista.length,
      porUsuario: Object.entries(porUsuario).map(([nombre, total]) => ({ nombre, total })),
      porAccion: Object.entries(porAccion).map(([nombre, total]) => ({ nombre, total })),
      lista,
    };
  }

  /** Deja constancia en auditoría de que un usuario imprimió un documento o reporte. */
  async registrarImpresion(
    usuario: { id: number; email?: string },
    reporte: string,
    detalle?: string,
  ) {
    await this.auditService.log({
      userId: String(usuario.id),
      userEmail: usuario.email,
      action: AuditAction.PRINT,
      entityType: 'reporte',
      entityId: reporte.slice(0, 36),
      newValue: { reporte, detalle },
    });
    return { ok: true };
  }
}
