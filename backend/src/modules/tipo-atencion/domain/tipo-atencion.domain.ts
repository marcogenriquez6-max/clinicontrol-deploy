export class TipoAtencionDomain {
  constructor(
    public readonly id?: number,
    public readonly nombre?: string,
    public readonly tipo?: 'consulta_nueva' | 'reconsulta',
    public readonly monto?: number,
    public readonly duracionMinutos?: number,
    public activo = true,
  ) {}
}
