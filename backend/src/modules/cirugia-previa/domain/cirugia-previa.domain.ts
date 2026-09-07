export class CirugiaPreviaDomain {
  constructor(
    public readonly id?: number,
    public readonly pacienteId?: number,
    public readonly nombreProcedimiento?: string,
    public readonly fechaCirugia?: string,
    public readonly hospital?: string,
    public readonly medicoCirujano?: string,
    public readonly tipoAnestesia?: string,
    public readonly complicaciones?: string,
    public readonly observaciones?: string,
    public activo = true,
  ) {}
}
