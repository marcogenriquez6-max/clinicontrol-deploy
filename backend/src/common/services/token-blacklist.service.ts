import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { RedisService } from './redis.service';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly BLACKLIST_PREFIX = 'blacklist:';
  private readonly memoryBlacklist = new Map<string, number>();
  private readonly MAX_MEMORY_ENTRIES = 5000;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000;

  constructor(private readonly redisService: RedisService) {
    setInterval(() => this.pruneExpired(), this.CLEANUP_INTERVAL);
  }

  private pruneExpired(): void {
    if (this.memoryBlacklist.size === 0) return;
    const now = Date.now();
    let pruned = 0;
    for (const [key, expiry] of this.memoryBlacklist.entries()) {
      if (now > expiry) {
        this.memoryBlacklist.delete(key);
        pruned++;
      }
    }
    if (pruned > 0) {
      this.logger.debug(`Pruned ${pruned} expired blacklist entries`);
    }
  }

  async add(
    token: string,
    expiresInMs: number = 15 * 60 * 1000,
  ): Promise<void> {
    const key = `${this.BLACKLIST_PREFIX}${this.hashToken(token)}`;
    const expiry = Date.now() + expiresInMs;

    if (this.redisService.isReady) {
      try {
        await this.redisService.set(key, { expiry }, expiresInMs);
        return;
      } catch (err) {
        this.logger.warn(
          `Redis blacklist set failed: ${(err as Error).message}`,
        );
      }
    }

    if (this.memoryBlacklist.size >= this.MAX_MEMORY_ENTRIES) {
      this.pruneExpired();
    }
    this.memoryBlacklist.set(key, expiry);
    this.logger.debug(`Token blacklisted, expires in ${expiresInMs}ms`);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const key = `${this.BLACKLIST_PREFIX}${this.hashToken(token)}`;

    if (this.redisService.isReady) {
      try {
        const exists = await this.redisService.exists(key);
        if (exists) return true;
      } catch (err) {
        this.logger.warn(
          `Redis blacklist check failed: ${(err as Error).message}`,
        );
      }
    }

    const expiry = this.memoryBlacklist.get(key);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.memoryBlacklist.delete(key);
      return false;
    }
    return true;
  }

  get size(): number {
    return this.memoryBlacklist.size;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
