import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';

export interface AuditLogParams {
  userId: string;
  userEmail?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  reason?: string;
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

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly SENSITIVE_FIELDS = [
    'password',
    'token',
    'secret',
    'mfa_secret',
    'refresh_token',
    'access_token',
    'authorization',
  ];

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async log(params: AuditLogParams): Promise<AuditLog> {
    const sanitize = (
      data: Record<string, any> | undefined,
    ): Record<string, any> | undefined => {
      if (!data) return data;
      const sanitized = { ...data };
      for (const field of this.SENSITIVE_FIELDS) {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      }
      return sanitized;
    };

    const entry = this.auditRepository.create({
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: sanitize(params.oldValue),
      newValue: sanitize(params.newValue),
      changes: params.changes ? sanitize(params.changes) : undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      sessionId: params.sessionId,
    });

    const saved = await this.auditRepository.save(entry);
    this.logger.log(
      `[AUDIT] ${params.action} on ${params.entityType}:${params.entityId} by ${params.userId}`,
    );
    return saved;
  }

  async getHistory(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async query(query: AuditQuery) {
    const {
      entityType,
      entityId,
      userId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const [data, total] = await this.auditRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserActivity(userId: string, limit = 20): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async logLogin(
    userId: string,
    userEmail: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      userId,
      userEmail,
      action: AuditAction.LOGIN,
      entityType: 'auth',
      entityId: userId,
      ipAddress,
      userAgent,
    });
  }

  async logLoginFailed(
    userEmail: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      userId: 'unknown',
      userEmail,
      action: AuditAction.LOGIN_FAILED,
      entityType: 'auth',
      entityId: 'unknown',
      ipAddress,
      userAgent,
    });
  }

  async logLogout(userId: string, userEmail: string): Promise<AuditLog> {
    return this.log({
      userId,
      userEmail,
      action: AuditAction.LOGOUT,
      entityType: 'auth',
      entityId: userId,
    });
  }
}
