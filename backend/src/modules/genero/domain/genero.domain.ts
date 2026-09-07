export class GeneroDomain {
  constructor(
    public readonly id?: number,
    public readonly nombre?: string,
    public activo = true,
  ) {}
}
