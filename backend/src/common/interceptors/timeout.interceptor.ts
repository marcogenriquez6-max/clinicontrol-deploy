import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
  SetMetadata,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

const TIMEOUT_KEY = 'requestTimeout';

export const SetTimeout = (ms: number) => SetMetadata(TIMEOUT_KEY, ms);

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly defaultTimeout = 30000;

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutMs =
      this.reflector.getAllAndOverride<number>(TIMEOUT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || this.defaultTimeout;

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `La solicitud excedió el límite de ${timeoutMs}ms`,
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
