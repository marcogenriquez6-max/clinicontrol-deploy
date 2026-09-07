import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { RecetaRepositoryPort } from '../domain/ports/receta-repository.port';
import { MedicamentoRepositoryPort } from '../domain/ports/medicamento-repository.port';
import { RecetaDomainService } from '../domain/services/receta-domain.service';
import {
  SeguridadFarmacologicaService,
  AlertaSeguridad,
} from '../domain/services/seguridad-farmacologica.service';
import { RecetaDomain, RecetaMedicamentoDomain } from '../domain/receta.domain';
import {
  CreateRecetaDto,
  UpdateRecetaDto,
  AddMedicamentoDto,
  DispensarRecetaDto,
} from '../infrastructure/dto/create-receta.dto';
import { HistoricoTratamientoServicePort } from '../domain/ports/historico-tratamiento-service.port';

@Injectable()
export class RecetaService {
  private readonly logger = new Logger(RecetaService.name);

  constructor(
    private readonly recetaRepo: RecetaRepositoryPort,
    private readonly medicamentoRepo: MedicamentoRepositoryPort,
    private readonly recetaDomainService: RecetaDomainService,
    private readonly seguridadFarmacologica: SeguridadFarmacologicaService,
    private readonly historicoTratamientoService: HistoricoTratamientoServicePort,
  ) {}

  async findAll(estado?: string) {
    return this.recetaRepo.findAll(estado);
  }

  async findOne(id: number): Promise<RecetaDomain> {
    const receta = await this.recetaRepo.findById(id);
    if (!receta)
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    return receta;
  }

  async findByConsulta(consultaId: number): Promise<RecetaDomain[]> {
    return this.recetaRepo.findByConsulta(consultaId);
  }

  async findMedicamentos(query?: string) {
    return this.medicamentoRepo.search(query);
  }

  async create(dto: CreateRecetaDto): Promise<RecetaDomain> {
    if (dto.medicamentos && dto.medicamentos.length > 0) {
      for (const item of dto.medicamentos) {
        this.recetaDomainService.validarMedicamentoItem(item);
      }
      this.recetaDomainService.validarItemsUnicos(dto.medicamentos);
    }

    const domain = new RecetaDomain({
      consultaId: dto.consultaId,
      instrucciones: dto.instrucciones,
      items: dto.medicamentos ?? [],
    });

    const saved = await this.recetaRepo.save(domain);

    const today = new Date().toISOString().split('T')[0];
    for (const item of saved.items) {
      if (item.id) {
        await this.historicoTratamientoService
          .create({
            consultaId: saved.consultaId,
            recetaId: saved.id as number,
            medicamentoId: item.medicamentoId,
            pacienteId: 0,
            fechaInicio: today,
            dosis: item.dosis,
            frecuencia: item.frecuencia,
            estado: 'activo',
            medicoId: 0,
            observaciones: item.observaciones,
          })
          .catch((err) => {
            this.logger.error(
              `Error creando historico de tratamiento: ${err.message}`,
            );
          });
      }
    }

    return saved;
  }

  async update(id: number, dto: UpdateRecetaDto): Promise<RecetaDomain> {
    await this.findOne(id);
    return this.recetaRepo.update(id, {
      instrucciones: dto.instrucciones,
    } as Partial<RecetaDomain>);
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.recetaRepo.remove(id);
  }

  async addMedicamento(recetaId: number, dto: AddMedicamentoDto) {
    const receta = await this.findOne(recetaId);
    this.recetaDomainService.validarMedicamentoItem(dto);
    const item = RecetaMedicamentoDomain.create(dto);
    return this.recetaRepo.addMedicamento(recetaId, item);
  }

  async removeMedicamento(itemId: number): Promise<void> {
    await this.recetaRepo.removeMedicamento(itemId);
  }

  async dispensar(
    recetaId: number,
    dto: DispensarRecetaDto,
    usuarioId: number,
  ): Promise<RecetaDomain> {
    const receta = await this.findOne(recetaId);
    const dispensaciones = dto.items.map((i) => ({
      recetaMedicamentoId: i.recetaMedicamentoId,
      cantidad: i.cantidadDispensada,
    }));
    this.recetaDomainService.validarDispensacion(receta, dispensaciones);

    for (const item of dto.items) {
      const rm = receta.items.find((i) => i.id === item.recetaMedicamentoId);
      if (!rm) {
        throw new NotFoundException(
          `Medicamento de receta ${item.recetaMedicamentoId} no encontrado`,
        );
      }
      rm.dispensar(item.cantidadDispensada);
    }

    receta.dispensar(dispensaciones);
    return this.recetaRepo.save(receta);
  }

  async verificarSeguridad(
    pacienteId: number,
    medicamentoIds: number[],
  ): Promise<{
    duplicidad: AlertaSeguridad[];
  }> {
    const duplicidad = await this.seguridadFarmacologica.verificarDuplicidad(
      pacienteId,
      medicamentoIds,
    );
    return { duplicidad };
  }

  async verificarSeguridadCompleta(
    pacienteId: number,
    medicamentoIds: number[],
  ) {
    return this.seguridadFarmacologica.verificarSeguridadCompleta(
      pacienteId,
      medicamentoIds,
    );
  }
}
