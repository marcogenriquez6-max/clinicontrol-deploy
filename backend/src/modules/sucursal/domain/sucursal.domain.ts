export class SucursalDomain {
  constructor(
    public readonly id?: number,
    public readonly nombre?: string,
    public readonly direccion?: string,
    public readonly telefono?: string,
    public readonly email?: string,
    public readonly rnc?: string,
    public activo = true,
  ) {}
}
