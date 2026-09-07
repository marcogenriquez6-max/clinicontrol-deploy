import { instanceToPlain } from 'class-transformer';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

export interface SuccessResponse<T = any> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
  timestamp: string;
}

const TRANSFORM_SKIP_KEY = 'skipTransform';

export const SkipTransform = () => SetMetadata(TRANSFORM_SKIP_KEY, true);

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    const skip = this.reflector.getAllAndOverride<boolean>(TRANSFORM_SKIP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return next.handle() as any;

    const response = context.switchToHttp().getResponse();
    const contentType = response.getHeader('Content-Type') as string;
    if (
      contentType &&
      (contentType.includes('pdf') ||
        contentType.includes('excel') ||
        contentType.includes('octet-stream') ||
        contentType.includes('image') ||
        contentType.includes('zip'))
    ) {
      return next.handle() as any;
    }

    return next.handle().pipe(
      map((data) => {
        const plain =
          data != null && typeof data === 'object' && !(data instanceof Buffer)
            ? instanceToPlain(data)
            : data;
        if (plain && typeof plain === 'object' && 'success' in (plain as any)) {
          return plain as any;
        }
        const response: SuccessResponse<T> = {
          success: true,
          data: plain as T,
          timestamp: new Date().toISOString(),
        };
        if (plain && typeof plain === 'object' && 'meta' in (plain as any)) {
          response.meta = (plain as any).meta;
          response.data = (plain as any).data;
        }
        return response;
      }),
    );
  }
}
