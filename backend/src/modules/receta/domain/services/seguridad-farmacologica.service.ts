import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RecetaRepositoryPort } from '../ports/receta-repository.port';
import {
  MedicamentoRepositoryPort,
  MedicamentoReadModel,
} from '../ports/medicamento-repository.port';
import { Paciente } from '../../../../entities/paciente.entity';
import { MedicamentoInteraccion } from '../../../../entities/medicamento-interaccion.entity';
import { Medicamento } from '../../../../entities/receta-medicamento.entity';

export interface AlertaSeguridad {
  tipo: 'DUPLICIDAD' | 'INTERACCION' | 'ALERGIA' | 'CONTRAINDICACION';
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  mensaje: string;
  medicamento1?: string;
  medicamento2?: string;
}

@Injectable()
export class SeguridadFarmacologicaService {
  constructor(
    private readonly recetaRepo: RecetaRepositoryPort,
    private readonly medicamentoRepo: MedicamentoRepositoryPort,
    @InjectRepository(Paciente)
    private readonly pacienteRepo: Repository<Paciente>,
    @InjectRepository(MedicamentoInteraccion)
    private readonly interaccionRepo: Repository<MedicamentoInteraccion>,
    @InjectRepository(Medicamento)
    private readonly medicamentoOrmRepo: Repository<Medicamento>,
  ) {}

  async verificarDuplicidad(
    pacienteId: number,
    nuevosMedicamentoIds: number[],
  ): Promise<AlertaSeguridad[]> {
    const alertas: AlertaSeguridad[] = [];
    const recetasActivas =
      await this.recetaRepo.findActiveByPaciente(pacienteId);

    const existingMedIds = new Set<number>();
    for (const receta of recetasActivas) {
      for (const item of receta.items) {
        existingMedIds.add(item.medicamentoId);
      }
    }

    for (const nuevoId of nuevosMedicamentoIds) {
      if (existingMedIds.has(nuevoId)) {
        const med = await this.medicamentoRepo.findById(nuevoId);
        alertas.push({
          tipo: 'DUPLICIDAD',
          severidad: 'alta',
          mensaje: `El paciente ya tiene recetado ${med?.nombre || 'este medicamento'}`,
          medicamento1: med?.nombre,
          medicamento2: med?.nombre,
        });
      }
    }

    return alertas;
  }

  async verificarAlergias(
    pacienteId: number,
    medicamentoIds: number[],
  ): Promise<AlertaSeguridad[]> {
    const alertas: AlertaSeguridad[] = [];

    const paciente = await this.pacienteRepo.findOne({
      where: { id: pacienteId },
      relations: ['alergias'],
    });

    if (!paciente?.alergias || paciente.alergias.length === 0) return alertas;

    const medicamentos = await this.medicamentoOrmRepo.find({
      where: { id: In(medicamentoIds) },
    });

    // Mapa de reactividad cruzada: grupo → grupos relacionados
    const CRUZ_REACTIVIDAD: Record<string, string[]> = {
      penicilinas: ['cefalosporinas', 'carbapenems'],
      cefalosporinas: ['penicilinas', 'carbapenems'],
      sulfonamidas: ['tiazidas', 'sulfonilureas'],
      aspirina: ['AINEs'],
      AINEs: ['aspirina'],
    };

    for (const med of medicamentos) {
      const grupoMed = (med.grupoFarmacologico || '').toLowerCase().trim();

      for (const alergia of paciente.alergias) {
        const nombreAlergia = alergia.nombre.toLowerCase().trim();

        // 1. Coincidencia directa: nombre del medicamento contiene el nombre de la alergia
        const nombreMed = med.nombre.toLowerCase();
        if (
          nombreMed.includes(nombreAlergia) ||
          nombreAlergia.includes(nombreMed)
        ) {
          alertas.push({
            tipo: 'ALERGIA',
            severidad:
              alergia.severidad === 'anafilactica' ? 'critica' : 'alta',
            mensaje: `El paciente es alérgico a ${alergia.nombre}. Riesgo con ${med.nombre}. ${alergia.descripcion || ''}`,
            medicamento1: med.nombre,
          });
          continue;
        }

        // 2. Grupo farmacológico: el medicamento pertenece a un grupo relacionado con la alergia
        if (grupoMed && nombreAlergia.includes(grupoMed)) {
          alertas.push({
            tipo: 'ALERGIA',
            severidad:
              alergia.severidad === 'anafilactica' ? 'critica' : 'alta',
            mensaje: `El paciente es alérgico a ${alergia.nombre}. ${med.nombre} pertenece al grupo ${med.grupoFarmacologico}. ${alergia.descripcion || ''}`,
            medicamento1: med.nombre,
          });
          continue;
        }

        // 3. Reactividad cruzada: grupos relacionados
        if (grupoMed) {
          const gruposRelacionados = CRUZ_REACTIVIDAD[grupoMed] || [];
          for (const grupoRel of gruposRelacionados) {
            if (nombreAlergia.includes(grupoRel)) {
              alertas.push({
                tipo: 'ALERGIA',
                severidad: 'media',
                mensaje: `Reactividad cruzada: ${med.nombre} (${med.grupoFarmacologico}) puede reaccionar con ${alergia.nombre} (${grupoRel}). ${alergia.descripcion || ''}`,
                medicamento1: med.nombre,
              });
              break;
            }
          }
        }
      }
    }

    return alertas;
  }

  async verificarInteracciones(
    medicamentoIds: number[],
  ): Promise<AlertaSeguridad[]> {
    const alertas: AlertaSeguridad[] = [];

    if (medicamentoIds.length < 2) return alertas;

    for (let i = 0; i < medicamentoIds.length; i++) {
      for (let j = i + 1; j < medicamentoIds.length; j++) {
        const interacciones = await this.interaccionRepo.find({
          where: [
            {
              medicamentoId1: medicamentoIds[i],
              medicamentoId2: medicamentoIds[j],
            },
            {
              medicamentoId1: medicamentoIds[j],
              medicamentoId2: medicamentoIds[i],
            },
          ],
        });

        for (const inter of interacciones) {
          const meds = await this.medicamentoOrmRepo.find({
            where: { id: In([inter.medicamentoId1, inter.medicamentoId2]) },
          });
          const nombres = meds.map((m) => m.nombre).join(' y ');

          let severidad: AlertaSeguridad['severidad'] = 'media';
          if (inter.severidad === 'severa') severidad = 'alta';
          else if (inter.severidad === 'contraindicada') severidad = 'critica';
          else if (inter.severidad === 'leve') severidad = 'baja';

          alertas.push({
            tipo: 'INTERACCION',
            severidad,
            mensaje: `Interacción entre ${nombres}: ${inter.descripcion}${inter.recomendacion ? ` Recomendación: ${inter.recomendacion}` : ''}`,
            medicamento1: meds[0]?.nombre,
            medicamento2: meds[1]?.nombre,
          });
        }
      }
    }

    return alertas;
  }

  async verificarDuplicidadTerapeutica(
    nuevosMedicamentoIds: number[],
  ): Promise<AlertaSeguridad[]> {
    const alertas: AlertaSeguridad[] = [];
    if (nuevosMedicamentoIds.length < 2) return alertas;

    const medicamentos = await this.medicamentoOrmRepo.find({
      where: { id: In(nuevosMedicamentoIds) },
    });

    const grupos = new Map<string, string[]>();
    for (const med of medicamentos) {
      const grupo = (med.grupoFarmacologico || '').toLowerCase().trim();
      if (!grupo) continue;
      if (!grupos.has(grupo)) grupos.set(grupo, []);
      grupos.get(grupo)!.push(med.nombre);
    }

    for (const [grupo, nombres] of grupos) {
      if (nombres.length > 1) {
        alertas.push({
          tipo: 'DUPLICIDAD',
          severidad: 'alta',
          mensaje: `Duplicidad terapéutica: ${nombres.join(', ')} pertenecen al mismo grupo (${grupo})`,
          medicamento1: nombres[0],
          medicamento2: nombres[1],
        });
      }
    }

    return alertas;
  }

  async verificarSeguridadCompleta(
    pacienteId: number,
    medicamentoIds: number[],
  ): Promise<{
    alergias: AlertaSeguridad[];
    duplicidad: AlertaSeguridad[];
    duplicidadTerapeutica: AlertaSeguridad[];
    interacciones: AlertaSeguridad[];
    total: AlertaSeguridad[];
  }> {
    const duplicidad = await this.verificarDuplicidad(
      pacienteId,
      medicamentoIds,
    );
    const alergias = await this.verificarAlergias(pacienteId, medicamentoIds);
    const duplicidadTerapeutica =
      await this.verificarDuplicidadTerapeutica(medicamentoIds);
    const interacciones = await this.verificarInteracciones(medicamentoIds);

    return {
      alergias,
      duplicidad,
      duplicidadTerapeutica,
      interacciones,
      total: [
        ...duplicidad,
        ...alergias,
        ...duplicidadTerapeutica,
        ...interacciones,
      ],
    };
  }
}
