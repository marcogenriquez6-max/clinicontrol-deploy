import { AuditDomain, AuditActionDomain } from '../audit.domain';

export interface AuditLogParams {
  userId: string;
  userEmail?: string;
  action: AuditActionDomain;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditQuery {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export abstract class AuditRepositoryPort {
  abstract log(params: AuditLogParams): Promise<AuditDomain>;
  abstract query(
    query: AuditQuery,
  ): Promise<{ data: AuditDomain[]; meta: any }>;
  abstract getHistory(
    entityType: string,
    entityId: string,
  ): Promise<AuditDomain[]>;
  abstract getUserActivity(
    userId: string,
    limit?: number,
  ): Promise<AuditDomain[]>;
}
