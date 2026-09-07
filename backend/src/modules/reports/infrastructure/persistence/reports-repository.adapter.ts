import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  ReportsRepositoryPort,
  PacienteReportData,
  CitaReportData,
  EstadisticasData,
  DashboardData,
  TriajeESIData,
  TriajeESIReport,
  HospitalizacionReport,
  IngresoEgresoData,
  CamaOcupacionData,
  IndicadoresEstadisticasData,
} from '../../domain/ports/reports-repository.port';
import { Paciente } from '../../../../entities/paciente.entity';
import { Cita } from '../../../../entities/cita.entity';
import { Consulta } from '../../../../entities/consulta.entity';
import { Receta } from '../../../../entities/receta-medicamento.entity';
import { Medico } from '../../../../entities/medico.entity';
import { Turno } from '../../../../entities/turno.entity';
import { Triage } from '../../../../entities/triage.entity';
import { ESILevel } from '../../../../entities/triage.entity';
import { Hospitalizacion, Cama, AdmisionEstado, BedStatus } from '../../../../entities/hospitalizacion.entity';
import { Usuario } from '../../../../entities/usuario.entity';
import { Cie10 } from '../../../../entities/cie10.entity';

@Injectable()
export class ReportsRepositoryAdapter implements ReportsRepositoryPort {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepo: Repository<Paciente>,
    @InjectRepository(Cita)
    private readonly citaRepo: Repository<Cita>,
    @InjectRepository(Consulta)
    private readonly consultaRepo: Repository<Consulta>,
    @InjectRepository(Receta)
    private readonly recetaRepo: Repository<Receta>,
    @InjectRepository(Medico)
    private readonly medicoRepo: Repository<Medico>,
    @InjectRepository(Turno)
    private readonly turnoRepo: Repository<Turno>,
    @InjectRepository(Cama)
    private readonly camaRepository: Repository<Cama>,
  ) {}

  async findPacienteConHistorial(
    pacienteId: number,
  ): Promise<PacienteReportData | null> {
    const p = await this.pacienteRepo.findOne({
      where: { id: pacienteId },
      relations: [
        'genero',
        'grupoSanguineo',
        'consultas',
        'consultas.medico',
        'consultas.diagnosticos',
        'consultas.diagnosticos.cie10',
        'consultas.recetas',
        'consultas.recetas.items',
        'consultas.recetas.items.medicamento',
      ],
    });
    if (!p) return null;
    return {
      id: p.id,
      nombre: p.nombre,
      apellido: p.apellido,
      ci: p.ci,
      fechaNacimiento: p.fechaNacimiento,
      telefono: p.telefono,
      email: p.email,
      genero: p.genero ? { nombre: p.genero.nombre } : undefined,
      grupoSanguineo: p.grupoSanguineo
        ? { nombre: p.grupoSanguineo.nombre }
        : undefined,
      activo: p.activo,
      createdAt: p.createdAt,
      consultas: (p.consultas || []).map((c) => ({
        fecha: c.fecha,
        medicoNombre: c.medico ? `${c.medico.nombre} ${c.medico.apellido}` : '',
        motivo: c.motivo,
        sintomas: c.sintomas,
        observaciones: c.observaciones,
        diagnosticos: (c.diagnosticos || []).map((d) => ({
          cie10: d.cie10
            ? { codigo: d.cie10.codigo, descripcion: d.cie10.descripcion }
            : undefined,
        })),
        recetas: (c.recetas || []).map((r) => ({
          items: (r.items || []).map((i) => ({
            medicamento: i.medicamento
              ? { nombre: i.medicamento.nombre }
              : undefined,
            dosis: i.dosis,
            frecuencia: i.frecuencia,
          })),
        })),
      })),
    };
  }

  async findCitas(
    fechaInicio?: string,
    fechaFin?: string,
    medicoId?: number,
    estadoId?: number,
  ): Promise<CitaReportData[]> {
    const where: Record<string, unknown> = {};
    if (medicoId) where.medico = { id: medicoId };
    if (estadoId) where.estado = { id: estadoId };
    if (fechaInicio && fechaFin) {
      where.fecha = Between(new Date(fechaInicio), new Date(fechaFin));
    }
    return this.citaRepo.find({
      where: where as any,
      relations: ['paciente', 'medico', 'medico.especialidad', 'estado'],
      order: { fecha: 'ASC' },
    });
  }

  async getEstadisticas(): Promise<EstadisticasData> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPacientes,
      totalMedicos,
      totalCitas,
      totalConsultas,
      citasHoy,
      recetasActivas,
    ] = await Promise.all([
      this.pacienteRepo.count({ where: { activo: true } }),
      this.medicoRepo.count(),
      this.citaRepo.count(),
      this.consultaRepo.count(),
      this.citaRepo.count({
        where: { fecha: Between(today, tomorrow) } as any,
      }),
      this.recetaRepo.count({ where: { estado: 'activa' } }),
    ]);

    return {
      totalPacientes,
      totalMedicos,
      totalCitas,
      totalConsultas,
      citasHoy,
      recetasActivas,
    };
  }

  async getDashboard(): Promise<DashboardData> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPacientes,
      totalMedicos,
      totalCitas,
      totalConsultas,
      citasHoy,
      recetasActivas,
      citasPendientes,
      turnosHoy,
      pacientesHoy,
    ] = await Promise.all([
      this.pacienteRepo.count({ where: { activo: true } }),
      this.medicoRepo.count(),
      this.citaRepo.count(),
      this.consultaRepo.count(),
      this.citaRepo.count({
        where: { fecha: Between(today, tomorrow) } as any,
      }),
      this.recetaRepo.count({ where: { estado: 'activa' } }),
      this.citaRepo.count({ where: { estadoId: 1 } }),
      this.turnoRepo
        .createQueryBuilder('t')
        .where('t.createdAt >= :today', { today })
        .andWhere('t.createdAt < :tomorrow', { tomorrow })
        .getCount(),
      this.pacienteRepo.count({
        where: { createdAt: Between(today, tomorrow) } as any,
      }),
    ]);

    return {
      totalPacientes,
      totalMedicos,
      totalCitas,
      totalConsultas,
      citasPendientes,
      turnosHoy,
      citasHoy,
      pacientesHoy,
      recetasActivas,
    };
  }

  async findAllPacientes(): Promise<PacienteReportData[]> {
    const pacientes = await this.pacienteRepo.find({
      relations: ['genero', 'grupoSanguineo'],
      order: { apellido: 'ASC', nombre: 'ASC' },
    });
    return pacientes.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      apellido: p.apellido,
      ci: p.ci,
      fechaNacimiento: p.fechaNacimiento,
      telefono: p.telefono,
      email: p.email,
      genero: p.genero ? { nombre: p.genero.nombre } : undefined,
      grupoSanguineo: p.grupoSanguineo
        ? { nombre: p.grupoSanguineo.nombre }
        : undefined,
      activo: p.activo,
      createdAt: p.createdAt,
      consultas: [],
    }));
  }

  async getTriajeESI(
    fechaInicio?: string,
    fechaFin?: string,
    realizadoPorId?: number,
  ): Promise<TriajeESIReport> {
    const where: Record<string, unknown> = { activo: true };
    if (fechaInicio && fechaFin) {
      where.fechaHora = Between(new Date(fechaInicio), new Date(fechaFin));
    }
    if (realizadoPorId) {
      where.realizadoPorId = realizadoPorId;
    }

    const orms = await this.pacienteRepo.manager
      .getRepository(Triage)
      .find({
        where,
        relations: ['paciente', 'realizadoPor'],
        order: { fechaHora: 'DESC' },
      });

    const total = orms.length;
    const porNivel: TriajeESIData[] = [
      { nivel: 1, nombre: 'Urgente', total: 0, porcentaje: 0 },
      { nivel: 2, nombre: 'Emergente', total: 0, porcentaje: 0 },
      { nivel: 3, nombre: 'Urgencia Media', total: 0, porcentaje: 0 },
      { nivel: 4, nombre: 'Menor', total: 0, porcentaje: 0 },
      { nivel: 5, nombre: 'No Urgente', total: 0, porcentaje: 0 },
    ];

    let totalEvaluados = 0;
    for (const t of orms) {
      const nivel = t.esiNivel;
      if (nivel >= 1 && nivel <= 5) {
        porNivel[nivel - 1].total++;
        totalEvaluados++;
      }
    }

    for (const d of porNivel) {
      d.porcentaje = totalEvaluados > 0 ? Math.round((d.total / totalEvaluados) * 100) : 0;
    }

    return {
      totalEvaluados,
      porNivel,
      generadoEn: new Date(),
    };
  }

  async getHospitalizacion(
    fechaInicio?: string,
    fechaFin?: string,
    medicoId?: number,
  ): Promise<HospitalizacionReport> {
    const where: Record<string, unknown> = { activo: true };
    if (fechaInicio && fechaFin) {
      where.fechaIngreso = Between(new Date(fechaInicio), new Date(fechaFin));
    }
    if (medicoId) {
      where.medicoTratanteId = medicoId;
    }

    const orms = await this.pacienteRepo.manager
      .getRepository(Hospitalizacion)
      .find({
        where,
        relations: ['paciente', 'medicoTratante', 'cama', 'usuarioRegistro'],
        order: { fechaIngreso: 'DESC' },
      });

    const total = orms.length;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const totalIngresos = orms.filter(
      (h) => h.estado === AdmisionEstado.ADMITIDO
    ).length;
    const totalEgresos = orms.filter(
      (h) => h.estado === AdmisionEstado.ALTA
    ).length;

    const ocupacionActual = orms.filter(
      (h) => h.estado !== AdmisionEstado.ALTA && h.fechaAlta == null
    ).length;

    const porEstado: IngresoEgresoData[] = [
      { estado: 'Ingresados', total: totalIngresos, porcentaje: total > 0 ? Math.round((totalIngresos / total) * 100) : 0 },
      { estado: 'Dados de Alta', total: totalEgresos, porcentaje: total > 0 ? Math.round((totalEgresos / total) * 100) : 0 },
    ];

    const camasOcupadas = await this.camaRepository.find({
      where: { estado: BedStatus.OCUPADO, activo: true },
    });

    const porCama: CamaOcupacionData[] = camasOcupadas.map((c) => ({
      camaId: c.id,
      codigoCama: c.codigoCama,
      estado: c.estado,
      ocupado: c.estado === BedStatus.OCUPADO,
    }));

    return {
      totalInternados: ocupacionActual,
      totalIngresos: totalIngresos,
      totalEgresos: totalEgresos,
      ocupacionActual,
      porEstado,
      porCama,
      generadoEn: new Date(),
    };
  }

  async getIndicadoresEstadisticas(
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<IndicadoresEstadisticasData> {
    const triajeWhere: Record<string, unknown> = { activo: true };
    if (fechaInicio && fechaFin) {
      triajeWhere.fechaHora = Between(new Date(fechaInicio), new Date(fechaFin));
    }

    const triageOrms = await this.pacienteRepo.manager
      .getRepository(Triage)
      .find({
        where: triajeWhere as any,
        relations: ['paciente', 'realizadoPor'],
        order: { fechaHora: 'DESC' },
      });

    const totalTriajes = triageOrms.length;

    const triajesPorNivel: TriajeESIData[] = [
      { nivel: 1, nombre: 'Urgente', total: 0, porcentaje: 0 },
      { nivel: 2, nombre: 'Emergente', total: 0, porcentaje: 0 },
      { nivel: 3, nombre: 'Urgencia Media', total: 0, porcentaje: 0 },
      { nivel: 4, nombre: 'Menor', total: 0, porcentaje: 0 },
      { nivel: 5, nombre: 'No Urgente', total: 0, porcentaje: 0 },
    ];

    let totalEvaluados = 0;
    for (const t of triageOrms) {
      if (t.esiNivel >= 1 && t.esiNivel <= 5) {
        triajesPorNivel[t.esiNivel - 1].total++;
        totalEvaluados++;
      }
    }

    for (const d of triajesPorNivel) {
      d.porcentaje = totalEvaluados > 0 ? Math.round((d.total / totalEvaluados) * 100) : 0;
    }

    const hospitalizacionWhere: Record<string, unknown> = { activo: true };
    if (fechaInicio && fechaFin) {
      hospitalizacionWhere.fechaIngreso = Between(new Date(fechaInicio), new Date(fechaFin));
    }

    const hospitalOrms = await this.pacienteRepo.manager
      .getRepository(Hospitalizacion)
      .find({
        where: hospitalizacionWhere as any,
        relations: ['paciente', 'medicoTratante'],
        order: { fechaIngreso: 'DESC' },
      });

    const total = hospitalOrms.length;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const totalEgresos = hospitalOrms.filter(
      (h) => h.estado === AdmisionEstado.ALTA,
    ).length;

    const pacientesNuevos = await this.pacienteRepo.count({
      where: {
        createdAt: Between(hoy, ayer as any),
      },
    });

    const consultasDelPeriodo = await this.consultaRepo.count({});

    const totalConsultas = await this.consultaRepo.count({ where: {} });

    const consultasPorMedico: Record<string, number> = {};
    const medicos = await this.medicoRepo.find();
    medicos.forEach((m) => {
      consultasPorMedico[m.id] = 0;
    });

    for (const c of await this.consultaRepo.find({
      relations: ['medico'],
      order: { fecha: 'DESC' },
    })) {
      if (consultasPorMedico[c.medicoId]) {
        consultasPorMedico[c.medicoId] =
          (consultasPorMedico[c.medicoId] || 0) + 1;
      }
    }

    const medicosConProductividad = await this.medicoRepo.find({
      relations: ['usuario'],
    });

    const productividadMedica: Record<string, {
      nombre: string;
      consultas: number;
    }> = {};
    medicosConProductividad.forEach((m) => {
      productividadMedica[m.id] = {
        nombre: `${m.nombre} ${m.apellido || ''}`,
        consultas: 0,
      };
    });

    const todasLasConsultas = await this.consultaRepo.find({
      relations: ['medico'],
    });
    todasLasConsultas.forEach((c) => {
      if (productividadMedica[c.medicoId]) {
        productividadMedica[c.medicoId].consultas++;
      }
    });

    const diagnosticos = await this.consultaRepo.find({
      relations: ['diagnosticos', 'diagnosticos.cie10'],
      order: { fecha: 'DESC' },
      take: 20,
    });

    const freqMap: Record<string, number> = {};
    diagnosticos.forEach((c) => {
      const codigo = c.diagnosticos?.[0]?.cie10?.codigo;
      if (codigo) {
        freqMap[codigo] = (freqMap[codigo] || 0) + 1;
      }
    });

    const diagnosticosTop: { codigo: string; descripcion: string }[] = [];
    const cie10Repo = this.pacienteRepo.manager.getRepository(Cie10);
    for (const [codigo, count] of Object.entries(freqMap).sort(
      (a, b) => b[1] - a[1],
    )) {
      const cie10 = await cie10Repo.findOne({ where: { codigo } });
      diagnosticosTop.push({
        codigo,
        descripcion: cie10?.descripcion || codigo,
      });
      if (diagnosticosTop.length >= 5) break;
    }

    const pacientesRecurrentes = total - pacientesNuevos;

    return {
      totalPacientes: total,
      totalMedicos: medicosConProductividad.length,
      totalCitas: total,
      totalConsultas: totalConsultas,
      totalEgresosHospitalizacion: totalEgresos,
      triajesRealizados: totalTriajes,
      pacientesNuevos,
      pacientesRecurrentes,
      consultasPorMedico,
      diagnosticosTop,
      productividadMedica,
      triajesPorNivel,
      generadoEn: new Date(),
    };
  }
}
