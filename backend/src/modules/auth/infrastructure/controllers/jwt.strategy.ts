import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { TokenBlacklistService } from '../../../../common/services/token-blacklist.service';
import type { JwtPayload } from '../../domain/ports/token-service.port';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authRepository: AuthRepositoryPort,
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(
    request: { headers: { authorization?: string } },
    payload: JwtPayload,
  ) {
    const authHeader = request.headers?.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (token && (await this.tokenBlacklist.isBlacklisted(token))) {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.authRepository.findById(payload.sub);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    if (user.bloqueado) throw new UnauthorizedException('Cuenta bloqueada');

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rolNombre,
      permissions: payload.permissions,
    };
  }
}
