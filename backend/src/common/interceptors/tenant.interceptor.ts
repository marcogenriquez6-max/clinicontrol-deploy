import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * TenantInterceptor — Extrae el sucursalId del usuario autenticado
 * y lo coloca en req.sucursalId para uso en controladores.
 *
 * Se ejecuta DESPUÉS de todos los guards (JwtAuthGuard, RolesGuard, etc.),
 * por lo que req.user ya está disponible.
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && typeof user === 'object' && 'sucursalId' in user) {
      request.sucursalId = user.sucursalId;
    }

    return next.handle();
  }
}
