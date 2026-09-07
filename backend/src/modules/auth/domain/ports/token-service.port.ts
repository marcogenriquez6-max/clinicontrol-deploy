import { UserDomain } from '../user.domain';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Vigencia del refresh token / cookie según la casilla "Recordar sesión". */
export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const REFRESH_TTL_REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;

export function refreshTtlMs(remember?: boolean): number {
  return remember ? REFRESH_TTL_REMEMBER_MS : REFRESH_TTL_MS;
}

export interface JwtPayload {
  sub: number;
  email: string;
  rol: string;
  permissions: string[];
  tokenId?: string;
  type?: string;
  /** Sesión recordada: el refresh token se emitió con expiración extendida. */
  remember?: boolean;
}

export abstract class TokenServicePort {
  abstract generateTokenPair(user: UserDomain, remember?: boolean): TokenPair;
  abstract verifyAccessToken(token: string): JwtPayload;
  abstract verifyRefreshToken(token: string): JwtPayload;
}
