export class AlergiaDomain {
  constructor(
    public readonly id?: number,
    public readonly nombre?: string,
    public readonly descripcion?: string,
    public readonly severidad?: string,
    public activo = true,
  ) {}
}
