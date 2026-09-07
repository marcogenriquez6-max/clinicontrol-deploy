import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export interface CurrentUser {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  permissions: string[];
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const ReqIp = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.ip || request.socket?.remoteAddress || 'unknown';
  },
);
