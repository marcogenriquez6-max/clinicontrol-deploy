import { Injectable } from '@nestjs/common';
import {
  AuditRepositoryPort,
  AuditLogParams,
  AuditQuery,
} from '../domain/ports/audit-repository.port';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepo: AuditRepositoryPort) {}

  async log(params: AuditLogParams) {
    return this.auditRepo.log(params);
  }
  async query(query: AuditQuery) {
    return this.auditRepo.query(query);
  }
  async getHistory(entityType: string, entityId: string) {
    return this.auditRepo.getHistory(entityType, entityId);
  }
  async getUserActivity(userId: string, limit = 20) {
    return this.auditRepo.getUserActivity(userId, limit);
  }
}
