import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { Rol } from '../../entities/rol.entity';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { MfaController } from './infrastructure/controllers/mfa.controller';
import { JwtStrategy } from './infrastructure/controllers/jwt.strategy';
import { AuthService } from './application/auth.service';
import { AuthDomainService } from './domain/services/auth-domain.service';
import { AuthRepositoryPort } from './domain/ports/auth-repository.port';
import { TokenServicePort } from './domain/ports/token-service.port';
import { AuthRepositoryAdapter } from './infrastructure/persistence/auth-repository.adapter';
import { JwtTokenAdapter } from './infrastructure/persistence/jwt-token.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET!,
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController, MfaController],
  providers: [
    AuthService,
    AuthDomainService,
    JwtStrategy,
    { provide: AuthRepositoryPort, useClass: AuthRepositoryAdapter },
    { provide: TokenServicePort, useClass: JwtTokenAdapter },
  ],
  exports: [
    AuthService,
    JwtStrategy,
    PassportModule,
    TokenServicePort,
    AuthRepositoryPort,
  ],
})
export class AuthModule {}
