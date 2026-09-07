import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { RedisService } from './services/redis.service';
import { RedisSessionService } from './services/redis-session.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { CacheService } from './services/cache.service';
import { AuditService } from './services/audit.service';
import { MinioService } from './services/minio.service';
import { TenantAwareService } from './services/tenant-aware.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [
    RedisService,
    RedisSessionService,
    TokenBlacklistService,
    CacheService,
    AuditService,
    MinioService,
    TenantAwareService,
  ],
  exports: [
    RedisService,
    RedisSessionService,
    TokenBlacklistService,
    CacheService,
    AuditService,
    MinioService,
    TenantAwareService,
  ],
})
export class CommonModule {}
