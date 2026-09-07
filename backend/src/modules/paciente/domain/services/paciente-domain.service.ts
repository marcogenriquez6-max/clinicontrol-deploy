import { Injectable } from '@nestjs/common';

@Injectable()
export class PacienteDomainService {
  validarCreacion(datos: {
    nombre: string;
    apellido: string;
    ci: string;
    fechaNacimiento: Date;
    email?: string;
    telefono?: string;
  }): string[] {
    const errores: string[] = [];
    if (!datos.nombre?.trim()) errores.push('El nombre es requerido');
    if (!datos.apellido?.trim()) errores.push('El apellido es requerido');
    if (!datos.ci?.trim()) errores.push('La cédula es requerida');
    if (!datos.fechaNacimiento)
      errores.push('La fecha de nacimiento es requerida');
    if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      errores.push('El formato del email no es válido');
    }
    if (datos.ci && !/^\d{5,15}$/.test(datos.ci)) {
      errores.push('La cédula debe contener entre 5 y 15 dígitos');
    }
    return errores;
  }
}
