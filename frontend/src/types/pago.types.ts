export interface Pago {
  id: number;
  numeroRecibo: string;
  turnoId?: number;
  turnoNumero?: number;
  turnoPrefijo?: string;
  pacienteId: number;
  pacienteNombre: string;
  pacienteCI: string;
  concepto: string;
  monto: number;
  metodoPago: string;
  estado: 'pagado' | 'anulado';
  fecha: string;
  usuarioId: number;
  usuarioNombre?: string;
  observaciones?: string;
  motivoAnulacion?: string;
}

export interface TurnoPendientePago {
  turnoId: number;
  numero: number;
  prefijo?: string;
  pacienteId: number;
  pacienteNombre: string;
  pacienteCI: string;
  concepto: string;
  monto: number;
  medicoNombre: string;
  horaProgramada?: string;
  createdAt: string;
  estado: string;
}

export interface ClinicaInfo {
  nombre: string;
  direccion: string;
  telefono: string;
  email?: string;
  nit: string;
}

export interface ReciboData {
  clinica: ClinicaInfo;
  pago: Pago;
}
