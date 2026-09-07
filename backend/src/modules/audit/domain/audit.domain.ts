export enum AuditActionDomain {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  PRINT = 'PRINT',
  LOGIN_FAILED = 'LOGIN_FAILED',
}

export class AuditDomain {
  constructor(
    public readonly id?: string,
    public userId?: string,
    public userEmail?: string,
    public action?: AuditActionDomain,
    public entityType?: string,
    public entityId?: string,
    public oldValue?: Record<string, any>,
    public newValue?: Record<string, any>,
    public changes?: Record<string, any>,
    public ipAddress?: string,
    public userAgent?: string,
    public sessionId?: string,
    public createdAt?: Date,
    public usuarioNombre?: string,
    public usuarioRol?: string,
  ) {}
}
