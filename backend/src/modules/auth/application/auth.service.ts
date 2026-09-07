import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { UserDomain } from '../domain/user.domain';
import { AuthRepositoryPort } from '../domain/ports/auth-repository.port';
import {
  TokenServicePort,
  refreshTtlMs,
} from '../domain/ports/token-service.port';
import { AuthDomainService } from '../domain/services/auth-domain.service';
import { TokenBlacklistService } from '../../../common/services/token-blacklist.service';
import { RedisSessionService } from '../../../common/services/redis-session.service';
import { AuditService } from '../../../common/services/audit.service';
import { RedisService } from '../../../common/services/redis.service';

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  ci?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  /** Vigencia de la cookie de refresh (ms). El controlador la usa y no la expone. */
  refreshMaxAgeMs: number;
  user: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly maxConcurrentSessions = 5;

  private readonly RESET_TOKEN_PREFIX = 'reset_token:';
  private readonly RESET_TOKEN_TTL = 60 * 60 * 1000;

  constructor(
    private readonly authRepository: AuthRepositoryPort,
    private readonly tokenService: TokenServicePort,
    private readonly domainService: AuthDomainService,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly sessionService: RedisSessionService,
    private readonly auditService: AuditService,
    private readonly redisService: RedisService,
  ) {}

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const errores = this.domainService.validarCredenciales(
      dto.email,
      dto.password,
    );
    if (errores.length > 0) throw new BadRequestException(errores.join('; '));

    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) {
      await this.auditService
        .logLoginFailed(dto.email, ipAddress, userAgent)
        .catch(() => {});
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.bloqueado) {
      await this.auditService
        .logLoginFailed(dto.email, ipAddress, userAgent)
        .catch(() => {});
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isValid = await this.domainService.verifyPassword(
      dto.password,
      user.password,
    );
    if (!isValid) {
      user.incrementarIntentosFallidos();
      await this.authRepository.save(user);
      if (ipAddress) {
        await this.sessionService.recordLoginAttempt(ipAddress).catch(() => {});
      }
      await this.auditService
        .logLoginFailed(dto.email, ipAddress, userAgent)
        .catch(() => {});
      throw new UnauthorizedException('Credenciales inválidas');
    }

    user.resetearIntentosFallidos();
    await this.authRepository.update(user.id, {
      intentosFallidos: 0,
      ultimoLogin: new Date(),
    });

    return this.buildAuthResponse(
      user,
      ipAddress,
      userAgent,
      dto.rememberMe ?? false,
    );
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existsEmail = await this.authRepository.existsByEmail(dto.email);
    if (existsEmail) throw new ConflictException('El email ya está registrado');

    if (dto.ci) {
      const existsCi = await this.authRepository.existsByCi(dto.ci);
      if (existsCi) throw new ConflictException('La cédula ya está registrada');
    }

    const defaultRolId = parseInt(
      process.env.DEFAULT_REGISTRATION_ROLE_ID || '6',
      10,
    );
    const defaultRolNombre =
      process.env.DEFAULT_REGISTRATION_ROLE || 'recepcionista';

    const hashedPassword = await this.domainService.hashPassword(dto.password);
    const user = new UserDomain({
      nombre: dto.nombre,
      apellido: dto.apellido,
      email: dto.email,
      password: hashedPassword,
      ci: dto.ci,
      rolId: defaultRolId,
      rolNombre: defaultRolNombre,
    });

    const saved = await this.authRepository.save(user);
    return this.buildAuthResponse(saved);
  }

  async refreshAccessToken(
    token: string,
    ipAddress?: string,
  ): Promise<AuthResponse> {
    try {
      const payload = this.tokenService.verifyRefreshToken(token);
      if (payload.type !== 'refresh')
        throw new UnauthorizedException('Token inválido');

      if (await this.tokenBlacklist.isBlacklisted(token)) {
        if (ipAddress) {
          this.logger.warn(
            `[SECURITY] Reused refresh token detected from IP ${ipAddress}`,
          );
        }
        throw new UnauthorizedException('Refresh token ya utilizado');
      }

      const remember = payload.remember ?? false;
      // El token queda en la lista negra durante toda su vigencia restante.
      await this.tokenBlacklist.add(token, refreshTtlMs(remember));

      const user = await this.authRepository.findById(payload.sub);
      if (!user || user.bloqueado)
        throw new UnauthorizedException('Usuario no encontrado o bloqueado');

      return this.buildAuthResponse(user, ipAddress, undefined, remember);
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async getProfile(userId: number) {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const sessionCount = await this.sessionService.getUserSessionCount(userId);

    return {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      ci: user.ci,
      rol: user.rolNombre || 'usuario',
      mfaEnabled: user.mfaEnabled,
      bloqueado: user.bloqueado,
      ultimoLogin: user.ultimoLogin,
      sessionCount,
    };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new BadRequestException('Usuario no encontrado');

    const isValid = await this.domainService.verifyPassword(
      currentPassword,
      user.password,
    );
    if (!isValid)
      throw new UnauthorizedException('Contraseña actual incorrecta');

    const newHash = await this.domainService.hashPassword(newPassword);
    user.actualizarPassword(newHash);
    await this.authRepository.save(user);

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async logout(userId: number, token?: string): Promise<{ message: string }> {
    if (token) {
      await this.tokenBlacklist.add(token, 15 * 60 * 1000);
      const tokenId = crypto.createHash('sha256').update(token).digest('hex');
      await this.sessionService.removeSession(tokenId);
    }

    try {
      const user = await this.authRepository.findById(userId);
      if (user && this.auditService) {
        await this.auditService.logLogout(String(userId), user.email);
      }
    } catch (err) {
      this.logger.error(`Audit log error: ${(err as Error).message}`);
    }

    return { message: 'Sesión cerrada exitosamente' };
  }

  async getUserSessions(userId: number) {
    return this.sessionService.getUserSessionIds(userId);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      return {
        message:
          'Si el email existe, recibirás un enlace para restablecer tu contraseña.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const key = `${this.RESET_TOKEN_PREFIX}${token}`;
    await this.redisService.set(
      key,
      { userId: user.id, email: user.email },
      this.RESET_TOKEN_TTL,
    );

    this.logger.log(`[FORGOT PASSWORD] Token generated for ${email}`);

    try {
      if (this.auditService) {
        await this.auditService.log({
          userId: String(user.id),
          userEmail: user.email,
          action: 'PASSWORD_RESET_REQUEST' as any,
          entityType: 'auth',
          entityId: String(user.id),
        });
      }
    } catch (err) {
      this.logger.error(`Audit log error: ${(err as Error).message}`);
    }

    return {
      message:
        'Si el email existe, recibirás un enlace para restablecer tu contraseña.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const key = `${this.RESET_TOKEN_PREFIX}${token}`;
    const data = await this.redisService.get<{ userId: number; email: string }>(
      key,
    );

    if (!data) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const user = await this.authRepository.findById(data.userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const hashedPassword = await this.domainService.hashPassword(newPassword);
    user.actualizarPassword(hashedPassword);
    await this.authRepository.save(user);

    await this.redisService.del(key);

    try {
      if (this.auditService) {
        await this.auditService.log({
          userId: String(user.id),
          userEmail: user.email,
          action: 'PASSWORD_RESET' as any,
          entityType: 'auth',
          entityId: String(user.id),
        });
      }
    } catch (err) {
      this.logger.error(`Audit log error: ${(err as Error).message}`);
    }

    return { message: 'Contraseña restablecida exitosamente' };
  }

  private async buildAuthResponse(
    user: UserDomain,
    ipAddress?: string,
    userAgent?: string,
    remember = false,
  ): Promise<AuthResponse> {
    const { accessToken, refreshToken } = this.tokenService.generateTokenPair(
      user,
      remember,
    );

    try {
      const tokenId = crypto
        .createHash('sha256')
        .update(accessToken)
        .digest('hex');
      await this.sessionService.createSession({
        tokenId,
        userId: user.id,
        email: user.email,
        rol: user.rolNombre || 'usuario',
        ipAddress,
        userAgent,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      });
      await this.sessionService.cleanUserSessions(
        user.id,
        this.maxConcurrentSessions,
      );
    } catch (err) {
      this.logger.error(`Session creation error: ${(err as Error).message}`);
    }

    try {
      if (this.auditService) {
        await this.auditService.logLogin(
          String(user.id),
          user.email,
          ipAddress,
          userAgent,
        );
      }
    } catch (err) {
      this.logger.error(`Audit log error: ${(err as Error).message}`);
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      refreshMaxAgeMs: refreshTtlMs(remember),
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rolNombre || 'usuario',
      },
      expiresIn: 15 * 60 * 1000,
    };
  }
}
