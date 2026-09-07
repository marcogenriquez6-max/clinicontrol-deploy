import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TenantAwareService {
  addTenantFilter<T>(qb: any, alias: string, request?: Request): any {
    const sucursalId = (request as any)?.sucursalId;
    if (sucursalId) {
      qb.andWhere(`${alias}.sucursalId = :sucursalId`, { sucursalId });
    }
    return qb;
  }

  getTenantWhere(request?: Request): { sucursalId?: number } {
    const sucursalId = (request as any)?.sucursalId;
    return sucursalId ? { sucursalId } : {};
  }
}
