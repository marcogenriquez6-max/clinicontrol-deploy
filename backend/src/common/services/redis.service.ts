import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isAvailable = false;

  async onModuleInit() {
    if (process.env.REDIS_ENABLED !== 'true') {
      this.logger.log('Redis disabled (REDIS_ENABLED != true). Skipping connection.');
      return;
    }
    await this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  async connect(): Promise<void> {
    if (this.client) return;

    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD || undefined;

    try {
      this.client = new Redis({
        host,
        port,
        password,
        retryStrategy: (times) => {
          if (times > 5) return null;
          return Math.min(times * 200, 3000);
        },
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.client.on('error', (err) => {
        this.logger.error(`Redis client error: ${(err as Error).message}`);
      });

      await this.client.connect();
      this.isAvailable = true;
      this.logger.log(`Redis connected to ${host}:${port}`);
    } catch (err) {
      this.isAvailable = false;
      if (this.client) {
        this.client.removeAllListeners('error');
        this.client.disconnect();
      }
      this.logger.warn(
        `Redis unavailable (${host}:${port}): ${(err as Error).message}. Cache disabled.`,
      );
      this.client = null;
    }
  }

  private getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis not connected');
    }
    return this.client;
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isAvailable || !this.client) return null;
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    if (!this.isAvailable || !this.client) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlMs !== undefined) {
        await this.client.setex(key, Math.ceil(ttlMs / 1000), serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err) {
      this.logger.error(`Redis set error: ${(err as Error).message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isAvailable || !this.client) return;
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.error(`Redis del error: ${(err as Error).message}`);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isAvailable || !this.client) return;
    try {
      let cursor = '0';
      do {
        const result = await this.client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = result[0];
        const keys = result[1];
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      this.logger.error(`Redis delPattern error: ${(err as Error).message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable || !this.client) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch {
      return false;
    }
  }

  get isReady(): boolean {
    return this.isAvailable;
  }

  private disconnect(): void {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
      this.isAvailable = false;
      this.logger.log('Redis disconnected');
    }
  }
}
