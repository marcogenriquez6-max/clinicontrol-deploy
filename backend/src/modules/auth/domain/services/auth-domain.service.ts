import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDomain } from '../user.domain';
import { getPermissionsForRole } from '../../../../common/constants/permissions';

@Injectable()
export class AuthDomainService {
  private readonly saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validarCredenciales(email: string, password: string): string[] {
    const errores: string[] = [];
    if (!email?.trim()) errores.push('El email es requerido');
    if (!password?.trim()) errores.push('La contraseña es requerida');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errores.push('El formato del email no es válido');
    }
    if (password && password.length < 6) {
      errores.push('La contraseña debe tener al menos 6 caracteres');
    }
    return errores;
  }

  validarNuevaPassword(password: string): string[] {
    const errores: string[] = [];
    if (!password || password.length < 8) {
      errores.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errores.push('La contraseña debe contener al menos una mayúscula');
    }
    if (!/[0-9]/.test(password)) {
      errores.push('La contraseña debe contener al menos un número');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errores.push('La contraseña debe contener al menos un carácter especial');
    }
    return errores;
  }

  getPermissions(rol?: string): string[] {
    return getPermissionsForRole(rol);
  }
}
