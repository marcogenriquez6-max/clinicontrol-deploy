export abstract class BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  activo: boolean;

  constructor(id?: number) {
    if (id) this.id = id;
    this.activo = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
