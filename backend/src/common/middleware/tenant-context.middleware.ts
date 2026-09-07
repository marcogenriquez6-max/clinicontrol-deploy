import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const user = (req as unknown as Record<string, unknown>)['user'] as
      | Record<string, unknown>
      | undefined;
    if (user && typeof user === 'object' && 'sucursalId' in user) {
      (req as unknown as Record<string, unknown>)['sucursalId'] =
        user['sucursalId'];
    }
    next();
  }
}
