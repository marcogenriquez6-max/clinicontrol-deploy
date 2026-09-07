import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface SessionInfo {
  tokenId: string;
  userId: number;
  email: string;
  rol: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: number;
  lastActivity: number;
}

export interface LoginAttemptInfo {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

@Injectable()
export class RedisSessionService {
  private readonly logger = new Logger(RedisSessionService.name);
  private readonly SESSION_PREFIX = 'session:';
  private readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  private readonly LOGIN_ATTEMPTS_PREFIX = 'login_attempts:';
  private readonly LOGIN_BLOCK_PREFIX = 'login_block:';
  private readonly SESSION_TTL_SEC = 7 * 24 * 60 * 60;
  private readonly MAX_LOGIN_ATTEMPTS = 10;
  private readonly LOGIN_WINDOW_MS = 60000;
  private readonly BLOCK_DURATION_MS = 300000;

  constructor(private readonly redis: RedisService) {}

  async createSession(session: SessionInfo): Promise<void> {
    if (!this.redis.isReady) return;
    try {
      const sessionKey = `${this.SESSION_PREFIX}${session.tokenId}`;
      await this.redis.set(sessionKey, session, this.SESSION_TTL_SEC * 1000);

      const userKey = `${this.USER_SESSIONS_PREFIX}${session.userId}`;
      const existing = await this.redis.get<string[]>(userKey);
      const tokenIds = existing || [];
      if (!tokenIds.includes(session.tokenId)) {
        tokenIds.push(session.tokenId);
      }
      await this.redis.set(userKey, tokenIds, this.SESSION_TTL_SEC * 1000);
    } catch (err) {
      this.logger.error(`Create session error: ${(err as Error).message}`);
    }
  }

  async getSession(tokenId: string): Promise<SessionInfo | null> {
    if (!this.redis.isReady) return null;
    try {
      return await this.redis.get<SessionInfo>(
        `${this.SESSION_PREFIX}${tokenId}`,
      );
    } catch {
      return null;
    }
  }

  async removeSession(tokenId: string): Promise<void> {
    if (!this.redis.isReady) return;
    try {
      const session = await this.getSession(tokenId);
      if (session) {
        const userKey = `${this.USER_SESSIONS_PREFIX}${session.userId}`;
        const existing = await this.redis.get<string[]>(userKey);
        if (existing) {
          const filtered = existing.filter((id) => id !== tokenId);
          if (filtered.length > 0) {
            await this.redis.set(
              userKey,
              filtered,
              this.SESSION_TTL_SEC * 1000,
            );
          } else {
            await this.redis.del(userKey);
          }
        }
      }
      await this.redis.del(`${this.SESSION_PREFIX}${tokenId}`);
    } catch (err) {
      this.logger.error(`Remove session error: ${(err as Error).message}`);
    }
  }

  async removeAllUserSessions(userId: number): Promise<string[]> {
    const removed: string[] = [];
    if (!this.redis.isReady) return removed;
    try {
      const userKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
      const tokenIds = await this.redis.get<string[]>(userKey);
      if (tokenIds) {
        for (const tokenId of tokenIds) {
          await this.redis.del(`${this.SESSION_PREFIX}${tokenId}`);
          removed.push(tokenId);
        }
        await this.redis.del(userKey);
      }
    } catch (err) {
      this.logger.error(
        `Remove all user sessions error: ${(err as Error).message}`,
      );
    }
    return removed;
  }

  async cleanUserSessions(
    userId: number,
    maxSessions: number = 5,
  ): Promise<void> {
    if (!this.redis.isReady) return;
    try {
      const userKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
      const tokenIds = await this.redis.get<string[]>(userKey);
      if (!tokenIds || tokenIds.length <= maxSessions) return;

      const sessions = (
        await Promise.all(
          tokenIds.map(async (id) => {
            const s = await this.getSession(id);
            return s ? { tokenId: id, createdAt: s.createdAt } : null;
          }),
        )
      ).filter(Boolean) as { tokenId: string; createdAt: number }[];

      sessions.sort((a, b) => a.createdAt - b.createdAt);
      const toRemove = sessions.slice(0, sessions.length - maxSessions);
      for (const s of toRemove) {
        await this.removeSession(s.tokenId);
      }
    } catch (err) {
      this.logger.error(`Clean sessions error: ${(err as Error).message}`);
    }
  }

  async recordLoginAttempt(
    identifier: string,
  ): Promise<{ blocked: boolean; remainingAttempts: number }> {
    if (!this.redis.isReady)
      return { blocked: false, remainingAttempts: this.MAX_LOGIN_ATTEMPTS };
    try {
      const now = Date.now();
      const blockKey = `${this.LOGIN_BLOCK_PREFIX}${identifier}`;
      const blocked = await this.redis.get<{ until: number }>(blockKey);
      if (blocked && blocked.until > now) {
        return { blocked: true, remainingAttempts: 0 };
      }

      const key = `${this.LOGIN_ATTEMPTS_PREFIX}${identifier}`;
      let data = await this.redis.get<LoginAttemptInfo>(key);
      if (!data || now - data.firstAttempt > this.LOGIN_WINDOW_MS) {
        data = { count: 1, firstAttempt: now, lastAttempt: now };
      } else {
        data.count++;
        data.lastAttempt = now;
      }

      if (data.count >= this.MAX_LOGIN_ATTEMPTS) {
        await this.redis.set(
          blockKey,
          { until: now + this.BLOCK_DURATION_MS },
          this.BLOCK_DURATION_MS,
        );
        await this.redis.del(key);
        return { blocked: true, remainingAttempts: 0 };
      }

      await this.redis.set(key, data, this.LOGIN_WINDOW_MS);
      return {
        blocked: false,
        remainingAttempts: this.MAX_LOGIN_ATTEMPTS - data.count,
      };
    } catch (err) {
      this.logger.error(
        `Record login attempt error: ${(err as Error).message}`,
      );
      return { blocked: false, remainingAttempts: 1 };
    }
  }

  async clearLoginAttempts(identifier: string): Promise<void> {
    if (!this.redis.isReady) return;
    try {
      await this.redis.del(`${this.LOGIN_ATTEMPTS_PREFIX}${identifier}`);
      await this.redis.del(`${this.LOGIN_BLOCK_PREFIX}${identifier}`);
    } catch {}
  }

  async getUserSessionCount(userId: number): Promise<number> {
    if (!this.redis.isReady) return 0;
    try {
      const tokenIds = await this.redis.get<string[]>(
        `${this.USER_SESSIONS_PREFIX}${userId}`,
      );
      return tokenIds?.length || 0;
    } catch {
      return 0;
    }
  }

  async getUserSessionIds(userId: number): Promise<string[]> {
    if (!this.redis.isReady) return [];
    try {
      return (
        (await this.redis.get<string[]>(
          `${this.USER_SESSIONS_PREFIX}${userId}`,
        )) || []
      );
    } catch {
      return [];
    }
  }
}
