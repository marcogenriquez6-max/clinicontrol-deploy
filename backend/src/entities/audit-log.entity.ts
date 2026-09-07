import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  PRINT = 'PRINT',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Entity('audit_log')
@Index('idx_audit_user', ['userId'])
@Index('idx_audit_entity', ['entityType', 'entityId'])
@Index('idx_audit_action', ['action'])
@Index('idx_audit_created', ['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: true })
  userId: string;

  @Column({ name: 'user_email', type: 'varchar', length: 255, nullable: true })
  userEmail: string;

  @Column({ type: 'varchar', length: 20, enum: AuditAction })
  action: AuditAction;

  @Column({ name: 'entity_type', type: 'varchar', length: 50, nullable: true })
  entityType: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 36, nullable: true })
  entityId: string;

  @Column({ name: 'old_value', type: 'simple-json', nullable: true })
  oldValue: Record<string, any>;

  @Column({ name: 'new_value', type: 'simple-json', nullable: true })
  newValue: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  changes: Record<string, any>;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ name: 'session_id', type: 'varchar', length: 36, nullable: true })
  sessionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
