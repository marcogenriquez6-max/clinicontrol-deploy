import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly memoryCache = new Map<
    string,
    { value: any; expiry: number }
  >();
  private readonly MAX_MEMORY_ENTRIES = 1000;
  private readonly USE_REDIS_PREFIX = 'cache:';

  constructor(private readonly redisService: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    if (this.redisService.isReady) {
      try {
        const val = await this.redisService.get<T>(key);
        if (val !== null) return val;
      } catch {
        return this.getFromMemory<T>(key);
      }
    }
    return this.getFromMemory<T>(key);
  }

  async set(key: string, value: any, ttlMs: number = 60000): Promise<void> {
    if (this.redisService.isReady) {
      try {
        await this.redisService.set(key, value, ttlMs);
        return;
      } catch {
        this.setInMemory(key, value, ttlMs);
      }
    } else {
      this.setInMemory(key, value, ttlMs);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    const redisKey = `${this.USE_REDIS_PREFIX}${pattern}`;
    if (this.redisService.isReady) {
      await this.redisService.delPattern(`${redisKey}*`);
    }
    this.invalidateMemory(pattern);
  }

  async invalidateMany(patterns: string[]): Promise<void> {
    await Promise.all(patterns.map((p) => this.invalidate(p)));
  }

  async clear(): Promise<void> {
    if (this.redisService.isReady) {
      await this.redisService.delPattern(`${this.USE_REDIS_PREFIX}*`);
    }
    this.memoryCache.clear();
    this.logger.debug('Cache cleared');
  }

  getStats() {
    return {
      memoryEntries: this.memoryCache.size,
      redisAvailable: this.redisService.isReady,
    };
  }

  get size(): number {
    return this.memoryCache.size;
  }

  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  private setInMemory(key: string, value: any, ttlMs: number): void {
    this.pruneExpired();
    if (this.memoryCache.size >= this.MAX_MEMORY_ENTRIES) {
      let oldestKey: string | undefined;
      let oldestExpiry = Infinity;
      for (const [k, v] of this.memoryCache.entries()) {
        if (v.expiry < oldestExpiry) {
          oldestExpiry = v.expiry;
          oldestKey = k;
        }
      }
      if (oldestKey) this.memoryCache.delete(oldestKey);
    }
    this.memoryCache.set(key, { value, expiry: Date.now() + ttlMs });
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiry) this.memoryCache.delete(key);
    }
  }

  private invalidateMemory(pattern: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) keysToDelete.push(key);
    }
    for (const key of keysToDelete) {
      this.memoryCache.delete(key);
    }
  }
}
