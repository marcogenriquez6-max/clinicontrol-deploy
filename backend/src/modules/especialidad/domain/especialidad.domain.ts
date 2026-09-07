export class EspecialidadDomain {
  constructor(
    public readonly id?: number,
    public readonly nombre?: string,
    public activo = true,
  ) {}
}
