export class ArqueoDomain {
  constructor(
    public id: number,
    public fecha: Date,
    public montoEsperado: number,
    public montoReal: number,
    public diferencia: number,
    public observaciones?: string,
    public usuarioId?: number,
    public cajaSessionId?: number,
    public createdAt?: Date,
  ) {}
}
