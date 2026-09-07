import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Headers,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../../application/auth.service';
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../auth-dto/auth.dto';
import { Public } from '../../../../common/decorators/public.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
  CurrentUser,
  ReqIp,
} from '../../../../common/decorators/current-user.decorator';
import { SkipTransform } from '../../../../common/interceptors/transform.interceptor';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Autenticación')
@Controller('auth')
@SkipTransform()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(
    @Body(ValidationPipe) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @ReqIp() ipAddress?: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const authResult = await this.authService.login(
      { email: dto.email, password: dto.password, rememberMe: dto.rememberMe },
      ipAddress,
      userAgent,
    );

    const { refresh_token, refreshMaxAgeMs, ...result } = authResult;
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: refreshMaxAgeMs,
    });
    return result;
  }

  @Roles('admin')
  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado' })
  @ApiResponse({ status: 409, description: 'Email o CI ya existe' })
  async register(@Body(ValidationPipe) dto: RegisterDto) {
    return this.authService.register({
      nombre: dto.nombre,
      apellido: dto.apellido,
      email: dto.email,
      password: dto.password,
      ci: dto.ci,
    });
  }

  @Public()
  @Post('refresh')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiResponse({ status: 200, description: 'Nuevo token de acceso' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @ReqIp() ipAddress?: string,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token no proporcionado');

    const {
      refresh_token: newRefreshToken,
      refreshMaxAgeMs,
      ...result
    } = await this.authService.refreshAccessToken(refreshToken, ipAddress);
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: refreshMaxAgeMs,
    });
    return result;
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  @ApiResponse({ status: 401, description: 'Contraseña actual incorrecta' })
  async changePassword(
    @CurrentUser() user: { id: number },
    @Body(ValidationPipe) dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Email de recuperación enviado' })
  async forgotPassword(@Body(ValidationPipe) dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async resetPassword(@Body(ValidationPipe) dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  async profile(@CurrentUser() user: { id: number }) {
    return this.authService.getProfile(user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(
    @CurrentUser() user: { id: number },
    @Res({ passthrough: true }) res: Response,
    @Headers('authorization') auth?: string,
  ) {
    const token = auth?.replace('Bearer ', '');
    const result = await this.authService.logout(user.id, token);
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
    });
    return result;
  }
}
