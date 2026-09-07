export class VacunaDomain {
  constructor(
    public readonly id?: number,
    public readonly nombre?: string,
    public readonly descripcion?: string,
    public readonly dosisRecomendadas?: number,
    public readonly edadMinimaMeses?: number,
    public readonly edadMaximaMeses?: number,
    public readonly intervalodias?: number,
    public readonly esObligatoria?: boolean,
    public activo = true,
  ) {}
}
