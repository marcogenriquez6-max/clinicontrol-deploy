import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ROLES_KEY,
  PERMISSIONS_KEY,
  REQUIRE_BOTH_KEY,
} from '../decorators/roles.decorator';

type RoleName =
  | 'admin'
  | 'gerente'
  | 'secretaria'
  | 'medico'
  | 'enfermeria'
  | 'recepcionista'
  | 'paciente';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('No autenticado');
    }

    // Sin bypass: el administrador configura el sistema pero NO participa del
    // acto asistencial. Solo pasa si 'admin' figura explícitamente en @Roles().
    const userRole = (user.rol || '').toLowerCase();
    const hasRole = requiredRoles.some(
      (role) => userRole === role.toLowerCase(),
    );

    if (!hasRole) {
      this.logger.warn(
        `Usuario ${user.email} con rol ${user.rol} intentó acceder a ruta que requiere: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException('No autorizado para esta operación');
    }

    return true;
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requireBoth =
      this.reflector.getAllAndOverride<boolean>(REQUIRE_BOTH_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || false;

    if (!requiredPermissions && !requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('No autenticado');
    }

    const userPermissions: string[] = user.permissions || [];

    // El comodín '*' solo aplica cuando la ruta exige permisos explícitos;
    // nunca sustituye la lista de roles de la ruta.
    const hasPermission = requiredPermissions
      ? userPermissions.includes('*') ||
        requiredPermissions.every((permission) =>
          userPermissions.includes(permission),
        )
      : false;

    const userRole = (user.rol || '').toLowerCase();
    const hasRole = requiredRoles
      ? requiredRoles.some((role) => userRole === role.toLowerCase())
      : false;

    if (requireBoth) {
      if (!hasPermission || !hasRole) {
        this.logger.warn(
          `Usuario ${user.email} no cumple con roles Y permisos requeridos`,
        );
        throw new ForbiddenException('Permisos insuficientes');
      }
    } else {
      if (!hasPermission && !hasRole) {
        this.logger.warn(
          `Usuario ${user.email} no cumple con roles O permisos requeridos`,
        );
        throw new ForbiddenException('Permisos insuficientes');
      }
    }

    return true;
  }
}
