import { useEffect, useState, useRef } from 'react';
import { Search, User, Activity, Pill, Calendar, Heart, Thermometer, Weight, FileText, Clock, Stethoscope, ChevronRight, Pencil, Trash2, Printer, X, AlertTriangle, SearchX, UserPlus } from 'lucide-react';
import { Button, Card, Modal, Input, StatusBadge, severityToStatus } from '../components/ui';
import { toast } from '../components/ui/Toast';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { pacienteExtraService, consultaCompletaService, cirugiaService, pacienteService, citaService } from '../api/services';
import api from '../api/axios';
import { fmtFecha } from '../utils/impresion';
import type { Paciente, PerfilPaciente, CirugiaPrevia } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { lista } from '../utils/api.utils';
import { aFecha } from '../utils/impresion';

const formatDateShort = (dateStr: string) => aFecha(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const calcEdad = (fn?: string) => {
  if (!fn) return null;
  const d = new Date(fn);
  if (isNaN(d.getTime())) return null;
  const hoy = new Date();
  let e = hoy.getFullYear() - d.getFullYear();
  const m = hoy.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) e--;
  return e;
};

const DIAGNOSTICOS_FILTER = ['Todos', 'CARDIOVASCULAR', 'RESPIRATORIO', 'INFECCIOSO', 'TRAUMATOLOGICO', 'NEUROLOGICO', 'ONCOLOGICO', 'OTRO'];

export default function HistoriaClinicaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Paciente[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [todosPacientes, setTodosPacientes] = useState<Paciente[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [perfil, setPerfil] = useState<PerfilPaciente | null>(null);
  const [alergias, setAlergias] = useState<any[]>([]);
  const [cirugias, setCirugias] = useState<CirugiaPrevia[]>([]);
  // Expediente completo según el documento: además de consultas, hospitalizaciones y citas del paciente.
  interface HospItem { id: number; fechaIngreso: string; fechaAlta?: string | null; camaId?: number; medicoTratanteId?: number; motivoIngreso?: string; diagnosticoIngreso?: string; diagnosticoAlta?: string; estado: string }
  interface CitaItem { id?: number; fecha: string; horaInicio?: string; medicoId?: number; medico?: { nombre?: string; apellido?: string }; estado?: string | { nombre?: string }; motivo?: string }
  const estadoCitaTexto = (e?: string | { nombre?: string }) => (typeof e === 'string' ? e : e?.nombre) || 'pendiente';
  const estadoCitaVariant = (e?: string | { nombre?: string }): 'success' | 'warning' | 'danger' | 'info' => {
    const n = estadoCitaTexto(e).toLowerCase();
    if (n === 'completada') return 'success';
    if (n === 'cancelada' || n === 'no_asistio') return 'danger';
    if (n === 'confirmada' || n === 'en_curso') return 'info';
    return 'warning';
  };
  const [hospitalizaciones, setHospitalizaciones] = useState<HospItem[]>([]);
  const [citasPaciente, setCitasPaciente] = useState<CitaItem[]>([]);
  const [camasCat, setCamasCat] = useState<{ id: number; codigoCama: string; servicio?: string }[]>([]);
  const [medicosCat, setMedicosCat] = useState<{ id?: number; nombre: string; apellido: string }[]>([]);
  const ESTADO_HOSP: Record<string, string> = { admitido: 'Admitido', en_observacion: 'En observación', internado: 'Internado', alta: 'De alta', traslado: 'Traslado', fallecido: 'Fallecido' };
  const nombreCama = (id?: number) => camasCat.find((c) => c.id === id)?.codigoCama ?? (id ? `Cama #${id}` : '—');
  const nombreMedico = (id?: number, m?: { nombre?: string; apellido?: string }) => {
    if (m?.nombre) return `Dr. ${m.nombre} ${m.apellido ?? ''}`.trim();
    const x = medicosCat.find((d) => d.id === id);
    return x ? `Dr. ${x.nombre} ${x.apellido}` : (id ? `Médico #${id}` : '—');
  };
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showCirugiaModal, setShowCirugiaModal] = useState(false);
  const [editingCirugia, setEditingCirugia] = useState<CirugiaPrevia | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CirugiaPrevia | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroDiagnostico, setFiltroDiagnostico] = useState('Todos');
  const [consultaDetalle, setConsultaDetalle] = useState<any>(null);
  const [cirugiaForm, setCirugiaForm] = useState({
    nombreProcedimiento: '', fechaCirugia: '', hospital: '', medicoCirujano: '',
    tipoAnestesia: '', complicaciones: '', observaciones: '',
  });
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pacienteService.getAll().then(res => setTodosPacientes(res.data ?? [])).catch(() => { /* sin conexión */ });
  }, []);

  useEffect(() => {
    if (search.length < 2) {
      queueMicrotask(() => {
        setSearchResults([]);
        setShowResults(false);
      });
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await pacienteExtraService.buscar(search);
        setSearchResults(res.data);
        setShowResults(res.data.length > 0);
      } catch { setSearchResults([]); } finally { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Apertura directa del expediente (desde Pacientes, Agenda del Día o el buscador global)
  useEffect(() => {
    const id = Number(searchParams.get('paciente') ?? searchParams.get('pacienteId'));
    if (!id) return;
    let vivo = true;
    pacienteService.getById(id)
      .then((res) => { const p = (res.data ?? res) as Paciente; if (vivo && p?.id) void handleSelectPatient(p); })
      .catch(() => toast('error', 'Paciente no encontrado', 'No se pudo abrir el expediente solicitado'));
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSelectPatient = async (paciente: Paciente) => {
    setSelectedPatient(paciente);
    setShowResults(false);
    setSearch(`${paciente.nombre} ${paciente.apellido}`);
    setLoading(true);
    try {
      const [perfilRes, alergiasRes, historialRes, cirugiasRes] = await Promise.all([
        pacienteExtraService.getPerfil(paciente.id!),
        pacienteExtraService.getAlergias(paciente.id!),
        consultaCompletaService.getHistorial(paciente.id!),
        cirugiaService.getByPaciente(paciente.id!),
      ]);
      setPerfil(perfilRes.data);
      setAlergias(lista(alergiasRes));
      // El historial llega como { consultas: [...], notasEvolucion: [...] } (o como arreglo en versiones previas).
      const h = historialRes.data as unknown as { consultas?: unknown[] } | unknown[] | null;
      setHistorial(Array.isArray(h) ? h : (h?.consultas ?? lista(historialRes)));
      setCirugias(lista(cirugiasRes));
    } catch { toast('error', 'Error', 'No se pudo cargar la historia clínica'); } finally { setLoading(false); }
    // Hospitalizaciones y citas: se cargan aparte para que un 403 (p. ej. enfermería sin citas) no oculte el resto.
    const [hospRes, citasRes, camasRes, medicosRes] = await Promise.all([
      api.get('/hospitalizacion', { params: { pacienteId: paciente.id, limit: 50 } }).catch(() => null),
      citaService.getByPaciente(paciente.id!).catch(() => null),
      api.get('/camas').catch(() => null),
      api.get('/medicos').catch(() => null),
    ]);
    setHospitalizaciones(hospRes ? lista<HospItem>(hospRes) : []);
    setCitasPaciente(citasRes ? lista<CitaItem>(citasRes).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()) : []);
    setCamasCat(camasRes ? lista(camasRes) : []);
    setMedicosCat(medicosRes ? lista(medicosRes) : []);
  };

  const handleDeleteCirugia = async () => {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    try {
      await cirugiaService.delete(deleteTarget.id);
      setCirugias(prev => prev.filter(x => x.id !== deleteTarget.id));
      toast('success', 'Cirugía eliminada');
      setDeleteTarget(null);
    } catch { toast('error', 'Error al eliminar'); } finally { setDeleteLoading(false); }
  };

  const sortedHistorial = [...historial]
    .filter(e => {
      if (filtroFecha) {
        const entryDate = aFecha(e.fecha || e.consultaFecha || e.createdAt || 0);
        const filterDate = new Date(filtroFecha);
        if (entryDate.toDateString() !== filterDate.toDateString()) return false;
      }
      if (filtroDiagnostico !== 'Todos') {
        const diags = e.diagnosticos || [];
        const hasType = diags.some((d: any) => {
          const tipo = (d.tipo || '').toUpperCase();
          return tipo === filtroDiagnostico;
        });
        if (!hasType) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dA = aFecha(a.fecha || a.consultaFecha || a.createdAt || 0).getTime();
      const dB = aFecha(b.fecha || b.consultaFecha || b.createdAt || 0).getTime();
      return dB - dA;
    });

  const getValue = (obj: any, ...keys: string[]) => {
    for (const key of keys) { if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key]; }
    return null;
  };

  const renderDetalle = (entry: any) => {
    const sintomas = getValue(entry, 'sintomas');
    const temperatura = getValue(entry, 'temperatura');
    const frecuenciaCardiaca = getValue(entry, 'frecuenciaCardiaca');
    const presionArterial = getValue(entry, 'presionArterial');
    const peso = getValue(entry, 'peso');
    const saturacionOxigeno = getValue(entry, 'saturacionOxigeno');
    const planTratamiento = getValue(entry, 'planTratamiento');
    const observaciones = getValue(entry, 'observaciones', 'indicaciones');
    const diagnosticos = entry.diagnosticos || [];
    const recetas = entry.recetas || [];
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: 'var(--primary-500)' }} />Motivo</p>
          <p className="text-sm text-[var(--text-primary)]">{getValue(entry, 'motivoConsulta', 'motivo') || '-'}</p>
          {sintomas && <p className="text-sm text-[var(--text-secondary)] mt-1">{sintomas}</p>}
        </div>
        {(temperatura ?? frecuenciaCardiaca ?? presionArterial ?? peso ?? saturacionOxigeno) && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: 'var(--danger-500)' }} />Signos Vitales</p>
            <div className="flex flex-wrap gap-2">
              {temperatura !== null && <span className="text-xs font-semibold rounded-md px-2 py-1" style={{ backgroundColor: 'var(--danger-50)', color: 'var(--danger-700)' }}><Thermometer className="w-3 h-3 inline mr-1" />{temperatura}°C</span>}
              {frecuenciaCardiaca !== null && <span className="text-xs font-semibold rounded-md px-2 py-1" style={{ backgroundColor: 'var(--warning-50)', color: 'var(--warning-700)' }}><Heart className="w-3 h-3 inline mr-1" />{frecuenciaCardiaca} lpm</span>}
              {presionArterial !== null && <span className="text-xs font-semibold rounded-md px-2 py-1" style={{ backgroundColor: 'var(--accent-50)', color: 'var(--accent-700)' }}><Activity className="w-3 h-3 inline mr-1" />{presionArterial} mmHg</span>}
              {saturacionOxigeno !== null && <span className="text-xs font-semibold rounded-md px-2 py-1" style={{ backgroundColor: 'var(--info-50)', color: 'var(--info-700)' }}><Activity className="w-3 h-3 inline mr-1" />SpO₂ {saturacionOxigeno}%</span>}
              {peso !== null && <span className="text-xs font-semibold rounded-md px-2 py-1" style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-700)' }}><Weight className="w-3 h-3 inline mr-1" />{peso} kg</span>}
            </div>
          </div>
        )}
        {diagnosticos.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: 'var(--warning-500)' }} />Diagnósticos</p>
            <ul className="space-y-1">
              {diagnosticos.map((dx: any, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--warning-500)' }} />
                  <div>
                    <span className="text-[var(--text-primary)]">{dx.descripcion || dx.diagnostico}</span>
                    {dx.cie10?.codigo && <span className="text-xs px-1.5 py-0.5 rounded ml-1 font-semibold" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)' }}>{dx.cie10.codigo}</span>}
                    {dx.tipo && <span className="text-xs text-[var(--text-tertiary)] ml-1">({dx.tipo})</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {recetas.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-500)' }} />Recetas</p>
            {recetas.map((receta: any, i: number) => {
              const meds = receta.items || receta.medicamentos || [];
              return meds.map((med: any, j: number) => (
                <div key={`${i}-${j}`} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                  <Pill className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent-600)' }} />
                  <span className="font-medium">{med.medicamento?.nombre || med.nombre}</span>
                  {med.dosis && <span className="text-[var(--text-tertiary)]">{med.dosis}</span>}
                  {med.frecuencia && <span className="text-[var(--text-tertiary)]">c/{med.frecuencia}</span>}
                  {med.duracion && <span className="text-[var(--text-tertiary)]">x {med.duracion}</span>}
                </div>
              ));
            })}
          </div>
        )}
        {planTratamiento && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: 'var(--success-500)' }} />Plan de Tratamiento</p>
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{planTratamiento}</p>
          </div>
        )}
        {observaciones && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: 'var(--info-500)' }} />Evolución / Notas</p>
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{observaciones}</p>
          </div>
        )}
      </div>
    );
  };

  if (!selectedPatient) {
    const q = norm(search.trim());
    const base = q ? todosPacientes.filter(p => norm(`${p.nombre} ${p.apellido} ${p.ci} ${p.telefono || ''}`).includes(q)) : todosPacientes;
    const extra = q.length >= 2 ? searchResults.filter(sr => sr.id != null && !base.some(b => b.id === sr.id)) : [];
    const listaMostrar = [...base, ...extra];
    return (
      <div className="max-w-2xl mx-auto pt-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl text-white flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: 'var(--primary-600)', boxShadow: '0 8px 24px -6px var(--primary-300)' }}>
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Historia Clínica</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Busque o seleccione un paciente para ver su historia clínica</p>
        </div>

        {/* Combobox de búsqueda con lista desplegable */}
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-quaternary)]" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o C.I...."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowResults(true)}
            className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-card)] dark:bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shadow-sm text-sm text-[var(--text-primary)] placeholder:text-[var(--text-quaternary)] focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all"
          />
          {searchLoading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[var(--primary-600)] border-t-transparent rounded-full animate-spin" />}

          {showResults && (
            <div className="absolute z-50 mt-2 w-full bg-[var(--bg-card)] dark:bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shadow-xl max-h-[340px] overflow-y-auto">
              {loading && listaMostrar.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[var(--primary-600)] border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-sm text-[var(--text-tertiary)]">Cargando pacientes...</span>
                </div>
              ) : listaMostrar.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <SearchX className="w-10 h-10 mx-auto mb-3 text-[var(--neutral-300)]" />
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">No se encontraron pacientes con ese criterio</p>
                  <p className="text-xs text-[var(--text-tertiary)] mb-4">Verifique la búsqueda o registre un nuevo paciente</p>
                  <Button size="sm" onClick={() => navigate('/pacientes')}>
                    <UserPlus className="w-4 h-4" /> Registrar Nuevo Paciente
                  </Button>
                </div>
              ) : (
                <>
                  <div className="sticky top-0 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-card)] dark:bg-[var(--bg-card)] border-b border-[var(--border-secondary)]" style={{ color: 'var(--text-quaternary)' }}>
                    Pacientes ({listaMostrar.length})
                  </div>
                  {listaMostrar.map((p, i) => {
                    const edad = calcEdad(p.fechaNacimiento);
                    const consultas = (p as any).consultas;
                    const ultima = Array.isArray(consultas) && consultas.length > 0 ? consultas[consultas.length - 1]?.fecha : null;
                    return (
                      <button
                        key={p.id ?? i}
                        onClick={() => handleSelectPatient(p)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--bg-secondary)] transition-colors text-left border-b border-[var(--border-secondary)] last:border-b-0 group"
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm bg-[var(--primary-50)] text-[var(--primary-600)] border border-[var(--primary-200)]">
                          {p.nombre.charAt(0)}{p.apellido?.charAt(0) || ''}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--text-primary)] truncate">{p.nombre} {p.apellido}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--text-secondary)] flex-wrap">
                            <span className="font-medium">CI: {p.ci}</span>
                            {p.telefono && <><span className="text-[var(--text-tertiary)]">·</span><span>{p.telefono}</span></>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                          {edad != null && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--primary-50)] text-[var(--primary-600)] border border-[var(--primary-200)]">{edad} años</span>
                          )}
                          {(typeof ultima === 'string') && (
                            <span className="text-xs text-[var(--text-tertiary)]">Últ.: {formatDateShort(ultima)}</span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--primary-500)] transition-all group-hover:translate-x-0.5 flex-shrink-0" />
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {!showResults && listaMostrar.length > 0 && (
          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-quaternary)' }}>
            {listaMostrar.length} paciente(s) disponible(s) — haga clic en el buscador para ver la lista
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Patient header */}
      <div className="bg-[var(--bg-card)] dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
        <div className="h-1" style={{ background: 'var(--primary-700)' }} />
        <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-lg shadow-md" style={{ backgroundColor: 'var(--primary-600)', boxShadow: '0 6px 16px -4px var(--primary-300)' }}>
              {selectedPatient.nombre.charAt(0)}{selectedPatient.apellido?.charAt(0) || ''}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{selectedPatient.nombre} {selectedPatient.apellido}</h2>
              <div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)]">C.I. {selectedPatient.ci}</span>
                {perfil?.edad && <span className="px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)' }}>{perfil.edad} años</span>}
                {perfil?.grupoSanguineo && <span className="px-2 py-0.5 rounded-full font-semibold border" style={{ backgroundColor: 'var(--danger-50)', color: 'var(--danger-700)', borderColor: 'var(--danger-200)' }}>{perfil.grupoSanguineo}</span>}
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium border" style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-700)', borderColor: 'var(--success-200)' }}><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--success-500)' }} />Historia activa</span>
              </div>
            </div>
          </div>
          <div className="relative w-full sm:w-64" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-quaternary)]" />
            <input
              type="text"
              placeholder="Cambiar paciente..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (e.target.value.length < 2) setShowResults(false); }}
              className="w-full pl-9 pr-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-quaternary)] focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-100)] transition-all"
            />
            {showResults && (
              <div className="absolute z-50 mt-1 w-full bg-[var(--bg-card)] dark:bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-md shadow-lg max-h-60 overflow-y-auto divide-y divide-[var(--border-secondary)]">
                {searchResults.map((p) => (
                  <button key={p.id} onClick={() => handleSelectPatient(p)} className="w-full px-3 py-2 flex items-center gap-2 hover:bg-[var(--primary-50)] text-left">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                      {p.nombre.charAt(0)}{p.apellido?.charAt(0) || ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)]">{p.nombre} {p.apellido}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{p.ci}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--primary-600)] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-[var(--text-tertiary)]">Cargando historia clínica...</span>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Consultas', value: perfil?.totalConsultas ?? historial.length, icon: Activity, color: 'var(--primary-600)', bg: 'var(--primary-50)' },
              { label: 'Recetas', value: perfil?.totalRecetas ?? historial.reduce((n, c) => n + ((c.recetas?.length) || 0), 0), icon: Pill, color: 'var(--accent-600)', bg: 'var(--accent-50)' },
              { label: 'Citas Pendientes', value: perfil?.citasPendientes ?? 0, icon: Calendar, color: 'var(--warning-600)', bg: 'var(--warning-50)' },
              { label: 'Última Visita', value: perfil?.ultimaConsulta ? formatDateShort(perfil.ultimaConsulta) : (sortedHistorial[0]?.fecha ? formatDateShort(sortedHistorial[0].fecha) : '-'), icon: Clock, color: 'var(--info-700)', bg: 'var(--info-50)' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[var(--bg-card)] dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg" style={{ backgroundColor: stat.bg, color: stat.color }}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--text-tertiary)]">{stat.label}</p>
                    <p className="text-base font-semibold text-[var(--text-primary)] truncate">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Allergies — borde rojo si hay alergia severa */}
          <Card
            title={<span><AlertTriangle className="w-4 h-4 inline mr-2 -mt-0.5" style={{ color: alergias.some((a) => { const s = (a.severidad || a.alergia?.severidad || '').toLowerCase(); return s === 'severa' || s === 'anafilactica'; }) ? 'var(--danger-600)' : 'var(--warning-600)' }} />Alergias</span>}
            subtitle="Alergias registradas"
            className={alergias.some((a) => { const s = (a.severidad || a.alergia?.severidad || '').toLowerCase(); return s === 'severa' || s === 'anafilactica'; }) ? 'border-l-4 border-l-[var(--danger-600)]' : alergias.length > 0 ? 'border-l-4 border-l-[var(--warning-500)]' : ''}
          >
            {alergias.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">No se registraron alergias</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {alergias.map((alergia, idx) => {
                  const a = alergia.alergia || alergia;
                  const sev = alergia.severidad || a.severidad || 'leve';
                  return (
                    <StatusBadge key={alergia.id || idx} variant={severityToStatus(sev)} dot>
                      {a.nombre || alergia.nombre}
                    </StatusBadge>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Surgeries */}
          <Card title="Cirugías Previas" subtitle={`${cirugias.length} cirugía(s) registrada(s)`} action={
            <Button size="sm" onClick={() => { setEditingCirugia(null); setCirugiaForm({ nombreProcedimiento: '', fechaCirugia: '', hospital: '', medicoCirujano: '', tipoAnestesia: '', complicaciones: '', observaciones: '' }); setShowCirugiaModal(true); }}>
              + Agregar
            </Button>
          }>
            {cirugias.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">No se registraron cirugías previas</p>
            ) : (
              <div className="space-y-2">
                {cirugias.map((c) => (
                  <div key={c.id} className="flex items-start justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-secondary)] hover:border-[var(--primary-200)] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{c.nombreProcedimiento}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-[var(--text-tertiary)]">
                        {c.fechaCirugia && <span>{c.fechaCirugia}</span>}
                        {c.hospital && <span>{c.hospital}</span>}
                        {c.medicoCirujano && <span>{c.medicoCirujano}</span>}
                      </div>
                      {c.complicaciones && <p className="text-xs mt-1" style={{ color: 'var(--danger-600)' }}>{c.complicaciones}</p>}
                    </div>
                    <div className="flex gap-1 ml-3">
                      <button onClick={() => { setEditingCirugia(c); setCirugiaForm({ nombreProcedimiento: c.nombreProcedimiento, fechaCirugia: c.fechaCirugia || '', hospital: c.hospital || '', medicoCirujano: c.medicoCirujano || '', tipoAnestesia: c.tipoAnestesia || '', complicaciones: c.complicaciones || '', observaciones: c.observaciones || '' }); setShowCirugiaModal(true); }} className="p-1.5 rounded-md text-[var(--text-quaternary)] hover:text-[var(--primary-600)] hover:bg-[var(--primary-50)] transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-md text-[var(--text-quaternary)] hover:text-[var(--danger-600)] hover:bg-[var(--danger-50)] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Hospitalizaciones" subtitle={`${hospitalizaciones.length} internación(es)`}>
            {hospitalizaciones.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">Sin hospitalizaciones registradas</p>
            ) : (
              <div className="space-y-2">
                {hospitalizaciones.map((h) => (
                  <div key={h.id} className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{h.diagnosticoIngreso || h.motivoIngreso || 'Internación'}</p>
                      <StatusBadge variant={h.estado === 'alta' ? 'success' : 'info'} dot>{ESTADO_HOSP[h.estado] ?? h.estado}</StatusBadge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-[var(--text-tertiary)]">
                      <span>Ingreso {fmtFecha(h.fechaIngreso)}</span>
                      {h.fechaAlta && <span>Alta {fmtFecha(h.fechaAlta)}</span>}
                      <span>{nombreCama(h.camaId)}</span>
                      <span>{nombreMedico(h.medicoTratanteId)}</span>
                    </div>
                    {h.diagnosticoAlta && <p className="text-xs mt-1 text-[var(--text-secondary)]">Diagnóstico de alta: {h.diagnosticoAlta}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Citas" subtitle={`${citasPaciente.length} cita(s)`}>
            {citasPaciente.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">Sin citas registradas</p>
            ) : (
              <div className="space-y-2">
                {citasPaciente.slice(0, 10).map((c, i) => (
                  <div key={c.id ?? i} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{fmtFecha(c.fecha)}{c.horaInicio ? ` · ${c.horaInicio}` : ''}</p>
                      <p className="text-xs text-[var(--text-tertiary)] truncate">{nombreMedico(c.medicoId, c.medico)}{c.motivo ? ` · ${c.motivo}` : ''}</p>
                    </div>
                    <StatusBadge variant={estadoCitaVariant(c.estado)} dot>{estadoCitaTexto(c.estado).replace('_', ' ')}</StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Timeline filters */}
          <div className="bg-[var(--bg-card)] dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] shadow-sm">
            <div className="px-5 py-4 border-b border-[var(--border-secondary)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Historial de Consultas</h3>
                <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{sortedHistorial.length} registro(s)</p>
              </div>
              <div className="flex items-center gap-3">
                {(filtroFecha || filtroDiagnostico !== 'Todos') && (
                  <button
                    onClick={() => { setFiltroFecha(''); setFiltroDiagnostico('Todos'); }}
                    className="text-xs text-[var(--text-tertiary)] hover:text-[var(--primary-600)] flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" /> Limpiar
                  </button>
                )}
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md px-2 py-1.5 text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-100)] transition-all"
                />
                <select
                  value={filtroDiagnostico}
                  onChange={(e) => setFiltroDiagnostico(e.target.value)}
                  className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md px-2 py-1.5 text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-100)] transition-all"
                >
                  {DIAGNOSTICOS_FILTER.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-5">
              {sortedHistorial.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-[var(--neutral-300)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-tertiary)]">No hay consultas registradas</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sortedHistorial.map((entry, idx) => {
                    const fecha = getValue(entry, 'fecha', 'consultaFecha', 'createdAt');
                    const medicoNombre = getValue(entry, 'medicoNombre', 'medico?.nombre') || [entry.medico?.nombre, entry.medico?.apellido].filter(Boolean).join(' ') || '-';
                    const especialidad = getValue(entry, 'especialidad', 'medico?.especialidad?.nombre') || '-';
                    const motivo = getValue(entry, 'motivoConsulta', 'motivo') || '-';
                    const diagnosticos = entry.diagnosticos || [];
                    const recetas = entry.recetas || [];
                    const dObj = fecha ? aFecha(fecha) : null;

                    return (
                      <button
                        key={entry.consultaId || entry.id || idx}
                        onClick={() => setConsultaDetalle(entry)}
                        className="w-full flex items-center gap-4 p-3 pl-4 bg-[var(--bg-card)] dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-secondary)] shadow-sm hover:border-[var(--primary-300)] hover:shadow-md transition-all duration-200 text-left group relative overflow-hidden"
                      >
                        {/* Acento lateral que se ilumina al pasar el mouse */}
                        <span className="absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-200 group-hover:w-1.5" style={{ backgroundColor: 'var(--primary-400)' }} />

                        {/* Tile de fecha */}
                        <div className="flex-shrink-0 w-14 text-center rounded-lg overflow-hidden border" style={{ borderColor: 'var(--primary-200)' }}>
                          <div className="text-xs font-bold uppercase tracking-widest text-white py-0.5" style={{ backgroundColor: 'var(--primary-600)' }}>
                            {dObj ? dObj.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '') : '—'}
                          </div>
                          <div className="py-1" style={{ backgroundColor: 'var(--primary-50)' }}>
                            <span className="text-lg font-extrabold leading-none block" style={{ color: 'var(--primary-700)' }}>{dObj ? dObj.getDate() : '·'}</span>
                            <span className="text-xs inline-flex items-center gap-0.5" style={{ color: 'var(--info-700)' }}><Clock className="w-2 h-2" />{dObj ? `${String(dObj.getHours()).padStart(2, '0')}:${String(dObj.getMinutes()).padStart(2, '0')}` : ''}</span>
                          </div>
                        </div>

                        {/* Médico + motivo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--info-50)', color: 'var(--info-700)' }}>
                              <Stethoscope className="w-3 h-3" />
                            </span>
                            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{medicoNombre}</span>
                            <span className="text-xs px-2 py-0.5 rounded-md font-medium whitespace-nowrap" style={{ backgroundColor: 'var(--info-50)', color: 'var(--info-700)' }}>{especialidad}</span>
                          </div>
                          <p className="text-xs text-[var(--text-tertiary)] truncate mt-1 max-w-xl">{motivo}</p>
                        </div>

                        {/* Contadores + flecha */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {diagnosticos.length > 0 && <span className="text-xs font-semibold rounded-md px-2 py-0.5" style={{ backgroundColor: 'var(--warning-50)', color: 'var(--warning-700)' }}>{diagnosticos.length} Dx</span>}
                          {recetas.length > 0 && <span className="text-xs font-semibold rounded-md px-2 py-0.5" style={{ backgroundColor: 'var(--accent-50)', color: 'var(--accent-700)' }}>{recetas.length} Rx</span>}
                          <ChevronRight className="w-4 h-4 transition-all group-hover:translate-x-1 group-hover:text-[var(--primary-600)]" style={{ color: 'var(--neutral-300)' }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/consultas', { state: { pacienteId: selectedPatient.id } })}>
              <FileText className="w-4 h-4" />Nueva Consulta
            </Button>
            <Button variant="secondary" onClick={() => setShowPerfilModal(true)}>
              <User className="w-4 h-4" />Ver Perfil Completo
            </Button>
            <Button variant="secondary" onClick={async () => {
              toast('info', 'Generando PDF...');
              const { generarHistoriaClinicaPdf } = await import('../utils/historia-pdf');
              await generarHistoriaClinicaPdf({
                paciente: selectedPatient,
                perfil,
                alergias,
                cirugias,
                historial,
              }, `historia-clinica-${selectedPatient.ci}.pdf`);
              toast('success', 'PDF generado', 'Reporte descargado');
            }}>
              <Printer className="w-4 h-4" />Generar Reporte PDF
            </Button>
          </div>
        </>
      )}

      {/* Surgery modal */}
      <Modal isOpen={showCirugiaModal} onClose={() => setShowCirugiaModal(false)} title={editingCirugia ? 'Editar Cirugía Previa' : 'Nueva Cirugía Previa'} size="md">
        <div className="space-y-4">
          <Input label="Procedimiento *" value={cirugiaForm.nombreProcedimiento} onChange={(e) => setCirugiaForm(f => ({ ...f, nombreProcedimiento: e.target.value }))} placeholder="Nombre del procedimiento" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha Cirugía" type="date" value={cirugiaForm.fechaCirugia} onChange={(e) => setCirugiaForm(f => ({ ...f, fechaCirugia: e.target.value }))} />
            <Input label="Hospital" value={cirugiaForm.hospital} onChange={(e) => setCirugiaForm(f => ({ ...f, hospital: e.target.value }))} placeholder="Nombre del hospital" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Médico Cirujano" value={cirugiaForm.medicoCirujano} onChange={(e) => setCirugiaForm(f => ({ ...f, medicoCirujano: e.target.value }))} placeholder="Nombre del cirujano" />
            <Input label="Tipo Anestesia" value={cirugiaForm.tipoAnestesia} onChange={(e) => setCirugiaForm(f => ({ ...f, tipoAnestesia: e.target.value }))} placeholder="Ej: General, Local" />
          </div>
          <Input label="Complicaciones" value={cirugiaForm.complicaciones} onChange={(e) => setCirugiaForm(f => ({ ...f, complicaciones: e.target.value }))} placeholder="Complicaciones si las hubo" />
          <Input label="Observaciones" value={cirugiaForm.observaciones} onChange={(e) => setCirugiaForm(f => ({ ...f, observaciones: e.target.value }))} placeholder="Observaciones adicionales" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCirugiaModal(false)}>Cancelar</Button>
            <Button onClick={async () => {
              if (!cirugiaForm.nombreProcedimiento.trim()) return toast('warning', 'El nombre del procedimiento es obligatorio');
              try {
                const pacienteId = selectedPatient?.id;
                if (!pacienteId) { toast('error', 'Error', 'No hay paciente seleccionado'); return; }
                const payload = { ...cirugiaForm, pacienteId };
                if (editingCirugia) {
                  const res = await cirugiaService.update(editingCirugia.id!, payload);
                  setCirugias(prev => prev.map(x => x.id === editingCirugia.id ? res.data : x));
                } else {
                  const res = await cirugiaService.create(payload);
                  setCirugias(prev => [...prev, res.data]);
                }
                setShowCirugiaModal(false);
                toast('success', editingCirugia ? 'Cirugía actualizada' : 'Cirugía registrada');
              } catch { toast('error', 'Error', 'No se pudo guardar'); }
            }}>{editingCirugia ? 'Actualizar' : 'Guardar'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCirugia}
        title="Eliminar Cirugía"
        message={`¿Eliminar cirugía "${deleteTarget?.nombreProcedimiento}"?`}
        confirmText="Eliminar"
        variant="danger"
        loading={deleteLoading}
      />

      <Modal isOpen={showPerfilModal} onClose={() => setShowPerfilModal(false)} title="Perfil Completo del Paciente" size="lg">
        {perfil && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Nombre Completo', value: perfil.nombreCompleto },
                { label: 'C.I.', value: perfil.ci },
                { label: 'Edad', value: `${perfil.edad} años` },
                { label: 'Fecha de Nacimiento', value: formatDateShort(perfil.fechaNacimiento) },
                { label: 'Género', value: perfil.genero || '-' },
                ...(perfil.grupoSanguineo ? [{ label: 'Grupo Sanguíneo', value: perfil.grupoSanguineo }] : []),
                { label: 'Teléfono', value: perfil.telefono || '-' },
                { label: 'Email', value: perfil.email || '-' },
              ].map(field => (
                <div key={field.label}>
                  <p className="text-xs text-[var(--text-secondary)]">{field.label}</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{field.value}</p>
                </div>
              ))}
            </div>
            {perfil.direccion && (
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Dirección</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{perfil.direccion}</p>
              </div>
            )}
            <div className="border-t border-[var(--border-secondary)] pt-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Consultas', value: perfil.totalConsultas },
                  { label: 'Total Recetas', value: perfil.totalRecetas },
                  { label: 'Citas Pendientes', value: perfil.citasPendientes },
                  { label: 'Registrado Desde', value: formatDateShort(perfil.registradoDesde) },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-xs text-[var(--text-secondary)]">{stat.label}</p>
                    <p className="text-base font-semibold text-[var(--text-primary)]">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Detalle de consulta */}
      <Modal
        isOpen={!!consultaDetalle}
        onClose={() => setConsultaDetalle(null)}
        title={consultaDetalle ? `Consulta — ${(() => { const f = getValue(consultaDetalle, 'fecha', 'consultaFecha', 'createdAt'); return f ? aFecha(f).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Sin fecha'; })()}` : 'Consulta'}
        size="lg"
      >
        {consultaDetalle && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Stethoscope className="w-4 h-4" style={{ color: 'var(--info-500)' }} />
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {getValue(consultaDetalle, 'medicoNombre', 'medico?.nombre') || [consultaDetalle.medico?.nombre, consultaDetalle.medico?.apellido].filter(Boolean).join(' ') || '-'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: 'var(--info-50)', color: 'var(--info-700)' }}>
                {getValue(consultaDetalle, 'especialidad', 'medico?.especialidad?.nombre') || '-'}
              </span>
            </div>
            {renderDetalle(consultaDetalle)}
          </div>
        )}
      </Modal>
    </div>
  );
}
