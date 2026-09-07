export class HistoricoTratamientoDomain {
  constructor(
    public readonly id?: number,
    public readonly pacienteId?: number,
    public readonly medicamentoId?: number,
    public readonly consultaId?: number,
    public readonly recetaId?: number,
    public readonly fechaInicio?: string,
    public readonly fechaFin?: string,
    public readonly dosis?: string,
    public readonly frecuencia?: string,
    public readonly viaAdministracionId?: number,
    public readonly estado?: string,
    public readonly motivoCambio?: string,
    public readonly medicoId?: number,
    public readonly observaciones?: string,
    public activo = true,
  ) {}
}
