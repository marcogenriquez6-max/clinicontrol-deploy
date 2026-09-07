import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import {
  TokenServicePort,
  TokenPair,
  JwtPayload,
} from '../../domain/ports/token-service.port';
import { UserDomain } from '../../domain/user.domain';
import { getPermissionsForRole } from '../../../../common/constants/permissions';

@Injectable()
export class JwtTokenAdapter implements TokenServicePort {
  private readonly accessExpiresIn = '15m';
  private readonly refreshExpiresIn = '7d';
  private readonly refreshExpiresInRemember = '30d';
  private readonly refreshSecret: string;

  constructor(private readonly jwtService: JwtService) {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is required');
    }
    this.refreshSecret = process.env.JWT_REFRESH_SECRET;
  }

  private generateTokenId(): string {
    return crypto.randomUUID();
  }

  private getPermissions(rol?: string): string[] {
    return getPermissionsForRole(rol);
  }

  generateTokenPair(user: UserDomain, remember = false): TokenPair {
    const tokenId = this.generateTokenId();
    const permissions = this.getPermissions(user.rolNombre);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      rol: user.rolNombre || 'usuario',
      permissions,
      tokenId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessExpiresIn,
    });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh', tokenId, remember },
      {
        secret: this.refreshSecret,
        expiresIn: remember
          ? this.refreshExpiresInRemember
          : this.refreshExpiresIn,
      },
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.refreshSecret,
    });
  }
}
