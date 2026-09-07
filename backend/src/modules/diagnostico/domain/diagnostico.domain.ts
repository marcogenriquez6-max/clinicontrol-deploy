export class DiagnosticoDomain {
  constructor(
    public readonly id?: number,
    public consultaId?: number,
    public cie10Id?: number,
    public codigo?: string,
    public descripcion?: string,
    public tipo = 'principal',
    public recomendaciones?: string,
    public esCronico = false,
    public createdAt?: Date,
  ) {}
}

export class Cie10Domain {
  constructor(
    public readonly id?: number,
    public codigo?: string,
    public descripcion?: string,
  ) {}
}
