import { BaseEntity } from '../../../common/domain';

export interface Permiso {
  recurso: string;
  accion: string;
}

export class UserDomain extends BaseEntity {
  nombre: string;
  apellido: string;
  email: string;
  ci?: string;
  password: string;
  hashPassword?: string;
  rolId: number;
  rolNombre?: string;
  telefono?: string;
  bloqueado: boolean;
  bloqueadoMotivo?: string;
  intentosFallidos: number;
  ultimoLogin?: Date;
  mfaEnabled: boolean;
  mfaSecret?: string;
  mfaMethod?: string;
  permisos: string[];

  constructor(props: {
    id?: number;
    nombre: string;
    apellido: string;
    email: string;
    ci?: string;
    password: string;
    rolId: number;
    rolNombre?: string;
    telefono?: string;
  }) {
    super(props.id);
    this.nombre = props.nombre;
    this.apellido = props.apellido;
    this.email = props.email;
    this.ci = props.ci;
    this.password = props.password;
    this.rolId = props.rolId;
    this.rolNombre = props.rolNombre;
    this.telefono = props.telefono;
    this.bloqueado = false;
    this.intentosFallidos = 0;
    this.mfaEnabled = false;
    this.permisos = [];
  }

  get nombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`;
  }

  incrementarIntentosFallidos(): void {
    this.intentosFallidos++;
    if (this.intentosFallidos >= 5) {
      this.bloquear('Demasiados intentos fallidos');
    }
  }

  resetearIntentosFallidos(): void {
    this.intentosFallidos = 0;
    this.ultimoLogin = new Date();
  }

  bloquear(motivo: string): void {
    this.bloqueado = true;
    this.bloqueadoMotivo = motivo;
  }

  desbloquear(): void {
    this.bloqueado = false;
    this.bloqueadoMotivo = undefined;
    this.intentosFallidos = 0;
  }

  habilitarMfa(secret: string, method: string): void {
    this.mfaSecret = secret;
    this.mfaMethod = method;
    this.mfaEnabled = false;
  }

  verificarMfa(): void {
    this.mfaEnabled = true;
  }

  deshabilitarMfa(): void {
    this.mfaSecret = undefined;
    this.mfaMethod = undefined;
    this.mfaEnabled = false;
  }

  actualizarPassword(nuevoHash: string): void {
    this.password = nuevoHash;
  }
}
