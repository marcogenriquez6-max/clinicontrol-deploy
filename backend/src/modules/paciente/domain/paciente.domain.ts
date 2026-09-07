import { BaseEntity } from '../../../common/domain';

export interface AlergiaInfo {
  id: number;
  nombre: string;
  severidad?: string;
}

export interface VacunaInfo {
  id: number;
  nombre: string;
  fechaAplicacion: Date;
}

export interface CirugiaPreviaInfo {
  id: number;
  descripcion: string;
  fecha: Date;
}

export class PacienteDomain extends BaseEntity {
  nombre: string;
  apellido: string;
  ci: string;
  fechaNacimiento: Date;
  generoId: number;
  telefono?: string;
  direccion?: string;
  email?: string;
  grupoSanguineoId?: number;
  usuarioRegistroId: number;
  sucursalId?: number;
  especialidad?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  estado?: string;
  alergias: AlergiaInfo[];
  vacunas: VacunaInfo[];
  cirugiasPrevias: CirugiaPreviaInfo[];

  constructor(props: {
    id?: number;
    nombre: string;
    apellido: string;
    ci: string;
    fechaNacimiento: Date;
    generoId: number;
    telefono?: string;
    direccion?: string;
    email?: string;
    grupoSanguineoId?: number;
    usuarioRegistroId: number;
    sucursalId?: number;
    especialidad?: string;
    contactoEmergenciaNombre?: string;
    contactoEmergenciaTelefono?: string;
  }) {
    super(props.id);
    this.nombre = props.nombre;
    this.apellido = props.apellido;
    this.ci = props.ci;
    this.fechaNacimiento = props.fechaNacimiento;
    this.generoId = props.generoId;
    this.telefono = props.telefono;
    this.direccion = props.direccion;
    this.email = props.email;
    this.grupoSanguineoId = props.grupoSanguineoId;
    this.usuarioRegistroId = props.usuarioRegistroId;
    this.sucursalId = props.sucursalId;
    this.especialidad = props.especialidad;
    this.contactoEmergenciaNombre = props.contactoEmergenciaNombre;
    this.contactoEmergenciaTelefono = props.contactoEmergenciaTelefono;
    this.alergias = [];
    this.vacunas = [];
    this.cirugiasPrevias = [];
  }

  get nombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`;
  }

  get edad(): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - this.fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - this.fechaNacimiento.getMonth();
    if (
      mes < 0 ||
      (mes === 0 && hoy.getDate() < this.fechaNacimiento.getDate())
    ) {
      edad--;
    }
    return edad;
  }

  actualizarDatos(
    datos: Partial<
      Pick<
        PacienteDomain,
        | 'nombre'
        | 'apellido'
        | 'telefono'
        | 'direccion'
        | 'email'
        | 'grupoSanguineoId'
        | 'generoId'
        | 'especialidad'
        | 'ci'
        | 'fechaNacimiento'
        | 'contactoEmergenciaNombre'
        | 'contactoEmergenciaTelefono'
      >
    >,
  ): void {
    if (datos.nombre !== undefined) this.nombre = datos.nombre;
    if (datos.apellido !== undefined) this.apellido = datos.apellido;
    if (datos.telefono !== undefined) this.telefono = datos.telefono;
    if (datos.direccion !== undefined) this.direccion = datos.direccion;
    if (datos.email !== undefined) this.email = datos.email;
    if (datos.grupoSanguineoId !== undefined)
      this.grupoSanguineoId = datos.grupoSanguineoId;
    if (datos.generoId !== undefined) this.generoId = datos.generoId;
    if (datos.especialidad !== undefined)
      this.especialidad = datos.especialidad;
    if (datos.ci !== undefined) this.ci = datos.ci;
    if (datos.fechaNacimiento !== undefined)
      this.fechaNacimiento = datos.fechaNacimiento;
    if (datos.contactoEmergenciaNombre !== undefined)
      this.contactoEmergenciaNombre = datos.contactoEmergenciaNombre;
    if (datos.contactoEmergenciaTelefono !== undefined)
      this.contactoEmergenciaTelefono = datos.contactoEmergenciaTelefono;
    this.updatedAt = new Date();
  }

  desactivar(): void {
    this.activo = false;
    this.updatedAt = new Date();
  }
}
