import { Injectable, ConflictException } from '@nestjs/common';
import { CitaDomain } from '../cita.domain';

@Injectable()
export class CitaDomainService {
  validarDisponibilidad(
    hayConflicto: boolean,
    conflictingCita?: CitaDomain,
    medicoNombre?: string,
  ): void {
    if (hayConflicto && conflictingCita) {
      const horasConflicto = `${conflictingCita.horaInicio} a ${conflictingCita.horaFin}`;
      throw new ConflictException(
        `El Dr. ${medicoNombre} ya tiene una cita de ${horasConflicto}. Elija otro horario.`,
      );
    }
  }

  validarHorarioLaboral(
    horaInicio: string,
    horaFin: string,
    horariosLaborales: Array<{
      horaInicio: string;
      horaFin: string;
      horaInicioTarde?: string;
      horaFinTarde?: string;
    }>,
  ): void {
    const [hI, mI] = horaInicio.split(':').map(Number);
    const [hF, mF] = horaFin.split(':').map(Number);
    const inicio = hI * 60 + mI;
    const fin = hF * 60 + mF;

    for (const h of horariosLaborales) {
      const [hlI, mlI] = h.horaInicio.split(':').map(Number);
      const [hlF, mlF] = h.horaFin.split(':').map(Number);
      if (inicio >= hlI * 60 + mlI && fin <= hlF * 60 + mlF) return;

      if (h.horaInicioTarde && h.horaFinTarde) {
        const [htI, mtI] = h.horaInicioTarde.split(':').map(Number);
        const [htF, mtF] = h.horaFinTarde.split(':').map(Number);
        if (inicio >= htI * 60 + mtI && fin <= htF * 60 + mtF) return;
      }
    }

    throw new ConflictException(
      'El horario solicitado no esta dentro del horario laboral del medico',
    );
  }
}
