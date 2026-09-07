import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Paciente, Medico, Cita, Especialidad, Genero, GrupoSanguineo, EstadoCita, Turno } from '../types';
import { pacienteService, medicoService, citaService, especialidadService, helpersService } from '../api/services';

interface ApiResponse<T> { data: T | T[] | { data: T[] }; }
type MaybeResponse<T> = ApiResponse<T> | T[] | T;

function extractArray<T>(res: MaybeResponse<T>): T[] {
  const d = (res as ApiResponse<T>)?.data ?? res;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'data' in d && Array.isArray((d as { data: T[] }).data)) {
    return (d as { data: T[] }).data;
  }
  return [];
}

interface AppState {
  pacientes: Paciente[];
  medicos: Medico[];
  citas: Cita[];
  turnos: Turno[];
  especialidades: Especialidad[];
  generos: Genero[];
  gruposSanguineos: GrupoSanguineo[];
  estadosCita: EstadoCita[];
  loading: boolean;
  lastTurnoNumero: number;
  _hasHydrated: boolean;

  fetchPacientes: () => Promise<void>;
  fetchMedicos: () => Promise<void>;
  fetchCitas: () => Promise<void>;
  fetchEspecialidades: () => Promise<void>;
  fetchHelpers: () => Promise<void>;
  addPaciente: (data: Partial<Paciente>) => Promise<Paciente>;
  updatePaciente: (id: number, data: Partial<Paciente>) => Promise<void>;
  deletePaciente: (id: number) => Promise<void>;
  addMedico: (data: Partial<Medico>) => Promise<Medico>;
  updateMedico: (id: number, data: Partial<Medico>) => Promise<void>;
  deleteMedico: (id: number) => Promise<void>;
  addCita: (data: Partial<Cita>) => Promise<Cita>;
  updateCita: (id: number, data: Partial<Cita>) => Promise<void>;
  deleteCita: (id: number) => Promise<void>;
  addTurno: (turno: Turno) => void;
  updateTurnoEstado: (id: number, estado: Turno['estado']) => void;
  marcarTurnoPagado: (id: number) => void;
  removeTurno: (id: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      pacientes: [],
      medicos: [],
      citas: [],
      turnos: [],
      especialidades: [],
      generos: [],
      gruposSanguineos: [],
      estadosCita: [],
      loading: false,
      lastTurnoNumero: 0,
      _hasHydrated: false,

      fetchPacientes: async () => {
        set({ loading: true });
        try {
          const res = await pacienteService.getAll();
          set({ pacientes: extractArray(res), loading: false });
        } catch { set({ loading: false }); }
      },

      fetchMedicos: async () => {
        set({ loading: true });
        try {
          const res = await medicoService.getAll();
          set({ medicos: extractArray(res), loading: false });
        } catch { set({ loading: false }); }
      },

      fetchCitas: async () => {
        set({ loading: true });
        try {
          const res = await citaService.getAll();
          const citas = extractArray(res) as Cita[];
          set({ citas, loading: false });
        } catch { set({ loading: false }); }
      },

      fetchEspecialidades: async () => {
        try {
          const res = await especialidadService.getAll();
          set({ especialidades: extractArray(res) });
        } catch { /* ignore */ }
      },

      fetchHelpers: async () => {
        try {
          const [generos, grupos, estados] = await Promise.all([
            helpersService.getGeneros(),
            helpersService.getGruposSanguineos(),
            helpersService.getEstadosCita(),
          ]);
          set({
            generos: extractArray(generos),
            gruposSanguineos: extractArray(grupos),
            estadosCita: extractArray(estados),
          });
        } catch { /* ignore */ }
      },

      addPaciente: async (data) => {
        const res = await pacienteService.create(data);
        const p = res.data;
        set((state) => ({ pacientes: [...state.pacientes, p] }));
        return p;
      },

      updatePaciente: async (id, data) => {
        const res = await pacienteService.update(id, data);
        const p = res.data;
        set((state) => ({
          pacientes: state.pacientes.map((x) => (x.id === id ? p : x)),
        }));
      },

      deletePaciente: async (id) => {
        await pacienteService.delete(id);
        set((state) => ({ pacientes: state.pacientes.filter((x) => x.id !== id) }));
      },

      addMedico: async (data) => {
        const res = await medicoService.create(data);
        const m = res.data;
        set((state) => ({ medicos: [...state.medicos, m] }));
        return m;
      },

      updateMedico: async (id, data) => {
        const res = await medicoService.update(id, data);
        const m = res.data;
        set((state) => ({
          medicos: state.medicos.map((x) => (x.id === id ? m : x)),
        }));
      },

      deleteMedico: async (id) => {
        await medicoService.delete(id);
        set((state) => ({ medicos: state.medicos.filter((x) => x.id !== id) }));
      },

      addCita: async (data) => {
        const res = await citaService.create(data);
        const c = res.data;
        set((state) => ({ citas: [...state.citas, c] }));
        return c;
      },

      updateCita: async (id, data) => {
        const res = await citaService.update(id, data);
        const c = res.data;
        set((state) => ({
          citas: state.citas.map((x) => (x.id === id ? c : x)),
        }));
      },

      deleteCita: async (id) => {
        await citaService.delete(id);
        set((state) => ({ citas: state.citas.filter((x) => x.id !== id) }));
      },

      addTurno: (turno) => {
        set((state) => ({
          turnos: [...state.turnos, turno],
          lastTurnoNumero: turno.numero,
        }));
      },

      updateTurnoEstado: (id, estado) => {
        set((state) => ({
          turnos: state.turnos.map((t) => (t.id === id ? { ...t, estado } : t)),
        }));
      },

      marcarTurnoPagado: (id) => {
        set((state) => ({
          turnos: state.turnos.map((t) =>
            t.id === id ? { ...t, pagado: true } : t
          ),
        }));
      },

      removeTurno: (id) => {
        set((state) => ({
          turnos: state.turnos.filter((t) => t.id !== id),
        }));
      },
    }),
    {
      name: 'clinica-turnos',
      partialize: (state) => ({
        turnos: state.turnos,
        lastTurnoNumero: state.lastTurnoNumero,
      }),
      onRehydrateStorage: () => () => {
        useStore.setState({ _hasHydrated: true });
      },
    }
  )
);
