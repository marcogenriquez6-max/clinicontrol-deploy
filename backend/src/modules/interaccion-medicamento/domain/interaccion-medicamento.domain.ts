export enum InteraccionSeveridadDomain {
  LEVE = 'leve',
  MODERADA = 'moderada',
  SEVERA = 'severa',
  CONTRAINDICADA = 'contraindicada',
}

export class MedicamentoInteraccionDomain {
  constructor(
    public readonly id?: number,
    public medicamentoId1?: number,
    public medicamentoId2?: number,
    public severidad: InteraccionSeveridadDomain = InteraccionSeveridadDomain.MODERADA,
    public descripcion?: string,
    public recomendacion?: string,
    public createdAt?: Date,
  ) {}
}
