import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource, EntityManager } from 'typeorm';
import {
  ConsultaRepositoryPort,
  ConsultaQuery,
} from '../../domain/ports/consulta-repository.port';
import {
  ConsultaDomain,
  DiagnosticoEntry,
  SignosVitales,
} from '../../domain/consulta.domain';
import { Consulta } from '../../../../entities/consulta.entity';
import { Diagnostico } from '../../../../entities/diagnostico.entity';
import { Receta } from '../../../../entities/receta-medicamento.entity';
import { RecetaMedicamento } from '../../../../entities/receta-medicamento.entity';
import {
  NotaEvolucionConsulta,
  TipoNotaEvolucion,
} from '../../../../entities/nota-evolucion.entity';

@Injectable()
export class ConsultaRepositoryAdapter implements ConsultaRepositoryPort {
  constructor(
    @InjectRepository(Consulta)
    private readonly repo: Repository<Consulta>,
    @InjectRepository(Diagnostico)
    private readonly diagnosticoRepo: Repository<Diagnostico>,
    @InjectRepository(Receta)
    private readonly recetaRepo: Repository<Receta>,
    @InjectRepository(RecetaMedicamento)
    private readonly recetaMedicamentoRepo: Repository<RecetaMedicamento>,
    @InjectRepository(NotaEvolucionConsulta)
    private readonly notaEvolucionRepo: Repository<NotaEvolucionConsulta>,
    private readonly dataSource: DataSource,
  ) {}

  private toDomain(orm: Consulta): ConsultaDomain {
    const domain = new ConsultaDomain({
      id: orm.id,
      pacienteId: orm.pacienteId,
      medicoId: orm.medicoId,
      citaId: orm.citaId,
      motivo: orm.motivo || '',
      sintomas: orm.sintomas || '',
      fecha: orm.fecha,
    });
    domain.enfermedadActual = orm.enfermedadActual;
    domain.examenFisico = orm.examenFisico;
    domain.evaluacion = orm.evaluacion;
    domain.planTratamiento = orm.planTratamiento;
    domain.indicaciones = orm.indicaciones;
    domain.esContinuacion = orm.esContinuacion || false;
    domain.consultaOriginalId = orm.consultaOriginalId;
    domain.motivoContinuacion = orm.motivoContinuacion;
    domain.createdAt = orm.createdAt;
    domain.updatedAt = orm.updatedAt;

    domain.agregarSignosVitales({
      presionArterialSistolica: orm.presionArterialSistolica,
      presionArterialDiastolica: orm.presionArterialDiastolica,
      frecuenciaCardiaca: orm.frecuenciaCardiaca,
      frecuenciaRespiratoria: orm.frecuenciaRespiratoria,
      temperatura: orm.temperatura,
      saturacionOxigeno: orm.saturacionOxigeno,
      glucosaCapilar: orm.glucosaCapilar,
      peso: orm.peso,
      talla: orm.talla,
    });

    if (orm.diagnosticos) {
      for (const d of orm.diagnosticos) {
        domain.agregarDiagnostico({
          cie10Id: d.cie10Id,
          descripcion: d.descripcion,
          tipo: d.tipo as DiagnosticoEntry['tipo'],
          esCronico: d.esCronico || false,
        });
      }
    }

    return domain;
  }

  async findById(id: number): Promise<ConsultaDomain | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: [
        'paciente',
        'medico',
        'medico.especialidad',
        'diagnosticos',
        'diagnosticos.cie10',
        'recetas',
        'recetas.items',
        'recetas.items.medicamento',
      ],
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findByIdWithRelations(
    id: number,
    relations: string[],
  ): Promise<ConsultaDomain | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: relations as any,
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findAll(query: ConsultaQuery): Promise<{
    data: ConsultaDomain[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { pacienteId, medicoId, fecha, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (pacienteId) where.paciente = { id: pacienteId };
    if (medicoId) where.medico = { id: medicoId };
    if (fecha) {
      const nextDay = new Date(fecha);
      nextDay.setDate(nextDay.getDate() + 1);
      where.fecha = Between(fecha, nextDay) as any;
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: [
        'paciente',
        'medico',
        'medico.especialidad',
        'diagnosticos',
        'recetas',
      ],
      skip,
      take: limit,
      order: { fecha: 'DESC' },
    });

    return {
      data: data.map((o) => this.toDomain(o)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async save(consulta: ConsultaDomain): Promise<ConsultaDomain> {
    const calcularImc = (peso?: number, talla?: number): number | undefined => {
      if (peso !== undefined && talla !== undefined && talla > 0) {
        return parseFloat((peso / (talla * talla)).toFixed(1));
      }
      return undefined;
    };

    if (consulta.id) {
      const sv = consulta.signosVitales;
      await this.repo.update(consulta.id, {
        motivo: consulta.motivo,
        sintomas: consulta.sintomas,
        enfermedadActual: consulta.enfermedadActual,
        examenFisico: consulta.examenFisico,
        evaluacion: consulta.evaluacion,
        planTratamiento: consulta.planTratamiento,
        indicaciones: consulta.indicaciones,
        peso: sv.peso,
        talla: sv.talla,
        temperatura: sv.temperatura,
        frecuenciaCardiaca: sv.frecuenciaCardiaca,
        frecuenciaRespiratoria: sv.frecuenciaRespiratoria,
        presionArterialSistolica: sv.presionArterialSistolica,
        presionArterialDiastolica: sv.presionArterialDiastolica,
        saturacionOxigeno: sv.saturacionOxigeno,
        glucosaCapilar: sv.glucosaCapilar,
        imc: calcularImc(sv.peso, sv.talla),
        esContinuacion: consulta.esContinuacion,
        consultaOriginalId: consulta.consultaOriginalId,
        motivoContinuacion: consulta.motivoContinuacion,
      } as any);
      return this.findByIdWithRelations(consulta.id, [
        'paciente',
        'medico',
        'medico.especialidad',
        'diagnosticos',
        'diagnosticos.cie10',
        'recetas',
        'recetas.items',
        'recetas.items.medicamento',
      ]) as Promise<ConsultaDomain>;
    }

    const sv = consulta.signosVitales;
    const orm = this.repo.create({
      pacienteId: consulta.pacienteId,
      medicoId: consulta.medicoId,
      citaId: consulta.citaId,
      motivo: consulta.motivo,
      sintomas: consulta.sintomas,
      enfermedadActual: consulta.enfermedadActual,
      examenFisico: consulta.examenFisico,
      evaluacion: consulta.evaluacion,
      planTratamiento: consulta.planTratamiento,
      indicaciones: consulta.indicaciones,
      fecha: consulta.fecha,
      peso: sv.peso,
      talla: sv.talla,
      temperatura: sv.temperatura,
      frecuenciaCardiaca: sv.frecuenciaCardiaca,
      frecuenciaRespiratoria: sv.frecuenciaRespiratoria,
      presionArterialSistolica: sv.presionArterialSistolica,
      presionArterialDiastolica: sv.presionArterialDiastolica,
      saturacionOxigeno: sv.saturacionOxigeno,
      glucosaCapilar: sv.glucosaCapilar,
      imc: calcularImc(sv.peso, sv.talla),
      esContinuacion: consulta.esContinuacion,
      consultaOriginalId: consulta.consultaOriginalId,
      motivoContinuacion: consulta.motivoContinuacion,
    } as Consulta);

    const saved = await this.repo.save(orm);

    if (consulta.diagnosticos.length > 0) {
      const diagnosticos = consulta.diagnosticos.map((d) =>
        this.diagnosticoRepo.create({
          consultaId: saved.id,
          cie10Id: d.cie10Id,
          descripcion: d.descripcion,
          tipo: d.tipo,
          esCronico: d.esCronico,
        }),
      );
      await this.diagnosticoRepo.save(diagnosticos);
    }

    return this.findById(saved.id) as Promise<ConsultaDomain>;
  }

  async update(
    id: number,
    data: Partial<ConsultaDomain>,
  ): Promise<ConsultaDomain> {
    const ormData: Partial<Consulta> = {};
    if (data.motivo !== undefined) ormData.motivo = data.motivo;
    if (data.sintomas !== undefined) ormData.sintomas = data.sintomas;
    if (data.enfermedadActual !== undefined)
      ormData.enfermedadActual = data.enfermedadActual;
    if (data.examenFisico !== undefined)
      ormData.examenFisico = data.examenFisico;
    if (data.evaluacion !== undefined) ormData.evaluacion = data.evaluacion;
    if (data.planTratamiento !== undefined)
      ormData.planTratamiento = data.planTratamiento;
    if (data.indicaciones !== undefined)
      ormData.indicaciones = data.indicaciones;
    if (data.signosVitales) {
      const sv = data.signosVitales;
      if (sv.peso !== undefined) ormData.peso = sv.peso;
      if (sv.talla !== undefined) ormData.talla = sv.talla;
      if (sv.temperatura !== undefined) ormData.temperatura = sv.temperatura;
      if (sv.frecuenciaCardiaca !== undefined)
        ormData.frecuenciaCardiaca = sv.frecuenciaCardiaca;
      if (sv.frecuenciaRespiratoria !== undefined)
        ormData.frecuenciaRespiratoria = sv.frecuenciaRespiratoria;
      if (sv.presionArterialSistolica !== undefined)
        ormData.presionArterialSistolica = sv.presionArterialSistolica;
      if (sv.presionArterialDiastolica !== undefined)
        ormData.presionArterialDiastolica = sv.presionArterialDiastolica;
      if (sv.saturacionOxigeno !== undefined)
        ormData.saturacionOxigeno = sv.saturacionOxigeno;
      if (sv.glucosaCapilar !== undefined)
        ormData.glucosaCapilar = sv.glucosaCapilar;
      if (sv.peso !== undefined && sv.talla !== undefined && sv.talla > 0) {
        ormData.imc = parseFloat((sv.peso / (sv.talla * sv.talla)).toFixed(1));
      }
    }
    await this.repo.update(id, ormData as any);
    return this.findByIdWithRelations(id, [
      'paciente',
      'medico',
      'medico.especialidad',
      'diagnosticos',
      'diagnosticos.cie10',
      'recetas',
      'recetas.items',
      'recetas.items.medicamento',
    ]) as Promise<ConsultaDomain>;
  }

  async findByPacienteId(pacienteId: number): Promise<ConsultaDomain[]> {
    const data = await this.repo.find({
      where: { paciente: { id: pacienteId } as any },
      relations: [
        'medico',
        'medico.especialidad',
        'diagnosticos',
        'diagnosticos.cie10',
        'recetas',
        'recetas.items',
        'recetas.items.medicamento',
      ],
      order: { fecha: 'DESC' },
    });
    return data.map((o) => this.toDomain(o));
  }

  async agregarNota(data: {
    consultaId: number;
    creadoPorId: number;
    contenido: string;
    tipo?: string;
  }): Promise<any> {
    const nota = this.notaEvolucionRepo.create({
      consultaId: data.consultaId,
      creadoPorId: data.creadoPorId,
      contenido: data.contenido,
      tipo: data.tipo || TipoNotaEvolucion.NOTA_MEDICA,
    });
    const saved = await this.notaEvolucionRepo.save(nota);
    return this.notaEvolucionRepo.findOne({
      where: { id: saved.id },
      relations: ['consulta', 'creadoPor'],
    });
  }

  async getHistorialCompleto(pacienteId: number): Promise<{
    consultas: ConsultaDomain[];
    notasEvolucion: any[];
  }> {
    const consultas = await this.repo.find({
      where: { paciente: { id: pacienteId } as any },
      relations: [
        'medico',
        'medico.especialidad',
        'diagnosticos',
        'diagnosticos.cie10',
        'recetas',
        'recetas.items',
        'recetas.items.medicamento',
        'notasEvolucion',
        'notasEvolucion.creadoPor',
      ],
      order: { fecha: 'DESC' },
    });

    const notasEvolucion = consultas
      .flatMap((c) => c.notasEvolucion || [])
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return {
      consultas: consultas.map((o) => this.toDomain(o)),
      notasEvolucion,
    };
  }
}
