export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Usuario {
  id?: number;
  nombre: string;
  apellido?: string;
  email: string;
  ci?: string;
  password?: string;
  rolId: number;
  rol?: Rol;
  activo?: boolean;
  telefono?: string;
  ultimoLogin?: string;
  createdAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
}
