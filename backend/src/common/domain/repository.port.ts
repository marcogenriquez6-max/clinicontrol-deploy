export interface RepositoryPort<T, QueryDto = unknown> {
  findById(id: number): Promise<T | null>;
  findAll(query?: QueryDto): Promise<{
    data: T[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>;
  save(entity: T): Promise<T>;
  update(id: number, entity: Partial<T>): Promise<T>;
  softDelete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
}
