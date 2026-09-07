export class ServicioDomain {
  constructor(
    public readonly id?: number,
    public readonly nombre?: string,
    public readonly descripcion?: string,
    public readonly especialidadId?: number,
    public readonly duracionMinutos?: number,
    public readonly monto?: number,
    public readonly activo?: boolean,
    public readonly requierePreparacion?: boolean,
    public readonly preparacionInstrucciones?: string,
  ) {}
}