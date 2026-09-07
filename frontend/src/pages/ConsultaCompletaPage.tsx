import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Shield, ArrowLeft, Printer, MessageSquareText, HeartPulse, ClipboardList, Pill } from 'lucide-react';
import { Button, Card, Input, Select, Textarea, Modal, Tabs } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { useStore } from '../store';
import {
  consultaCompletaService, recetaService, interaccionService, citaService, diagnosticoService, turnoService, triageService
} from '../api/services';
import VitalSignsGrid from '../components/consulta/VitalSignsGrid';
import DiagnosticoList from '../components/consulta/DiagnosticoList';
import MedicamentoList from '../components/consulta/MedicamentoList';
import SafetyVerificationModal from '../components/consulta/SafetyVerificationModal';
import BandaPaciente from '../components/clinico/BandaPaciente';
import type { ConsultaCompletaDto, Cita } from '../types';

interface DiagnosticoEntry {
  key: number;
  cie10Search: string;
  cie10Id?: number;
  descripcion: string;
  tipo: 'principal' | 'secundario' | 'complicacion' | 'cronico';
  esCronico: boolean;
}

interface MedicamentoEntry {
  key: number;
  search: string;
  medicamentoId?: number;
  medicamentoNombre?: string;
  dosis: string;
  frecuencia: string;
  via: string;
  duracion: string;
  cantidad: number;
  observaciones: string;
}

interface FormData {
  pacienteId: string;
  medicoId: string;
  citaId: string;
  esPrimeraVez: boolean;
  esContinuacion: boolean;
  consultaOriginalId: string;
  motivoConsulta: string;
  sintomas: string;
  enfermedadActual: string;
  peso: string;
  talla: string;
  temperatura: string;
  frecuenciaCardiaca: string;
  frecuenciaRespiratoria: string;
  presionArterialSistolica: string;
  presionArterialDiastolica: string;
  saturacionOxigeno: string;
  glucosaCapilar: string;
  examenFisico: string;
  evaluacion: string;
  planTratamiento: string;
  indicaciones: string;
  proximoControl: string;
  incapacidadDias: string;
  incapacidadFechaInicio: string;
  incapacidadFechaFin: string;
}



const VALIDACION = {
  REQUIRED: { required: 'Campo requerido' },
  MIN5: { required: 'Campo requerido', minLength: { value: 5, message: 'Mínimo 5 caracteres' } },
  PESO: { required: 'Campo requerido', min: { value: 0.5, message: 'Mínimo 0.5 kg' }, max: { value: 500, message: 'Máximo 500 kg' } },
  TALLA: { required: 'Campo requerido', min: { value: 10, message: 'Mínimo 10 cm' }, max: { value: 280, message: 'Máximo 280 cm' } },
  TEMP: { min: { value: 34, message: 'Mínimo 34°C' }, max: { value: 43, message: 'Máximo 43°C' } },
  FC: { min: { value: 20, message: 'Mínimo 20 lpm' }, max: { value: 250, message: 'Máximo 250 lpm' } },
  FR: { min: { value: 4, message: 'Mínimo 4 rpm' }, max: { value: 80, message: 'Máximo 80 rpm' } },
  PA: { min: { value: 30, message: 'Mínimo 30 mmHg' }, max: { value: 300, message: 'Máximo 300 mmHg' } },
  SPO2: { min: { value: 30, message: 'Mínimo 30%' }, max: { value: 100, message: 'Máximo 100%' } },
  GLUCOSA: { min: { value: 20, message: 'Mínimo 20 mg/dL' }, max: { value: 700, message: 'Máximo 700 mg/dL' } },
  INCAPACIDAD: { min: { value: 1, message: 'Mínimo 1 día' }, max: { value: 365, message: 'Máximo 365 días' } },
};

export default function ConsultaCompletaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as { pacienteId?: number; medicoId?: number; turnoId?: number; turnoNumero?: number; pacienteNombre?: string } | null;
  const { pacientes, medicos, fetchPacientes, fetchMedicos } = useStore();
  const [turnoId] = useState(navState?.turnoId ?? null);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      pacienteId: navState?.pacienteId ? String(navState.pacienteId) : '',
      medicoId: navState?.medicoId ? String(navState.medicoId) : '',
      citaId: '',
      esPrimeraVez: false,
      esContinuacion: false,
      consultaOriginalId: '',
      motivoConsulta: '',
      sintomas: '',
      enfermedadActual: '',
      peso: '',
      talla: '',
      temperatura: '',
      frecuenciaCardiaca: '',
      frecuenciaRespiratoria: '',
      presionArterialSistolica: '',
      presionArterialDiastolica: '',
      saturacionOxigeno: '',
      glucosaCapilar: '',
      examenFisico: '',
      evaluacion: '',
      planTratamiento: '',
      indicaciones: '',
      proximoControl: '',
      incapacidadDias: '',
      incapacidadFechaInicio: '',
      incapacidadFechaFin: '',
    },
  });

  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoEntry[]>([]);
  const [medicamentos, setMedicamentos] = useState<MedicamentoEntry[]>([]);
  const [citasPaciente, setCitasPaciente] = useState<Cita[]>([]);
  const [submitting, setSubmitting] = useState(false);
  interface CatalogoItem { id?: number; codigo?: string; nombre?: string; descripcion?: string; presentacion?: string; formaFarmaceutica?: string; concentracion?: string }
  const [medSearchResults, setMedSearchResults] = useState<Record<number, CatalogoItem[]>>({});
  const [cieSearchResults, setCieSearchResults] = useState<Record<number, CatalogoItem[]>>({});
  const [nextDiagKey, setNextDiagKey] = useState(1);
  const [nextMedKey, setNextMedKey] = useState(1);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [interaccionModalOpen, setInteraccionModalOpen] = useState(false);
  const [interaccionData, setInteraccionData] = useState<{ farmacoA?: string; farmacoB?: string; severidad?: string; descripcion?: string; efecto?: string; recomendacion?: string }[]>([]);
  const [safetyPacienteId, setSafetyPacienteId] = useState(0);
  const [safetyMedIds, setSafetyMedIds] = useState<number[]>([]);
  const [showEnmiendaModal, setShowEnmiendaModal] = useState(false);
  const [enmiendaMotivo, setEnmiendaMotivo] = useState('');
const [enmiendaMensajeBackend, setEnmiendaMensajeBackend] = useState('');

  const pacienteId = watch('pacienteId');
  const peso = watch('peso');
  const talla = watch('talla');
  const esContinuacion = watch('esContinuacion');

  useEffect(() => {
    fetchPacientes();
    fetchMedicos();
  }, []);

  useEffect(() => {
    if (pacienteId) {
      citaService.getByPaciente(Number(pacienteId)).then((res) => {
        const pendientes = res.data.filter((c) => c.estado?.nombre?.toLowerCase() === 'pendiente' || !c.estadoId);
        setCitasPaciente(pendientes);
      }).catch(() => setCitasPaciente([]));
    } else {
      setCitasPaciente([]);
    }
  }, [pacienteId]);

  // Precargar signos vitales del último triaje del paciente
  useEffect(() => {
    if (!pacienteId) return;
    triageService.getUltimoByPaciente(Number(pacienteId)).then((res) => {
      // El triaje de enfermería (signos vitales) precarga el bloque OBJETIVO del SOAP.
      const sv = (res.data ?? null) as typeof res.data | null;
      if (!sv || !sv.esiNivel) return;
      const fields: Record<string, string> = {};
      if (sv.peso) fields.peso = String(sv.peso);
      if (sv.talla) fields.talla = String(sv.talla);
      if (sv.temperatura) fields.temperatura = String(sv.temperatura);
      if (sv.frecuenciaCardiaca) fields.frecuenciaCardiaca = String(sv.frecuenciaCardiaca);
      if (sv.frecuenciaRespiratoria) fields.frecuenciaRespiratoria = String(sv.frecuenciaRespiratoria);
      const [sis, dia] = String(sv.presionArterial ?? '').split('/');
      if (sis && !Number.isNaN(Number(sis))) fields.presionArterialSistolica = sis.trim();
      if (dia && !Number.isNaN(Number(dia))) fields.presionArterialDiastolica = dia.trim();
      if (sv.saturacionOxigeno) fields.saturacionOxigeno = String(sv.saturacionOxigeno);
      if (sv.glucosa) fields.glucosaCapilar = String(sv.glucosa);
      reset((prev) => ({ ...prev, ...fields }));
    }).catch(() => {});
  }, [pacienteId]);

  const addDiagnostico = () => {
    setDiagnosticos([...diagnosticos, {
      key: nextDiagKey,
      cie10Search: '',
      descripcion: '',
      tipo: 'secundario',
      esCronico: false,
    }]);
    setNextDiagKey(nextDiagKey + 1);
  };

  const removeDiagnostico = (key: number) => {
    setDiagnosticos(diagnosticos.filter((d) => d.key !== key));
  };

  const updateDiagnostico = (key: number, field: keyof DiagnosticoEntry, value: string | number | boolean) => {
    setDiagnosticos((prev) => prev.map((d) => d.key === key ? { ...d, [field]: value } : d));
  };

  const addMedicamento = () => {
    if (diagnosticos.length === 0) {
      toast('warning', 'Diagnóstico requerido', 'Registre el diagnóstico antes de prescribir');
      return;
    }
    setMedicamentos([...medicamentos, {
      key: nextMedKey,
      search: '',
      dosis: '',
      frecuencia: '',
      via: '',
      duracion: '',
      cantidad: 0,
      observaciones: '',
    }]);
    setNextMedKey(nextMedKey + 1);
  };

  const removeMedicamento = (key: number) => {
    setMedicamentos(medicamentos.filter((m) => m.key !== key));
  };

  const updateMedicamento = (key: number, field: keyof MedicamentoEntry, value: string | number) => {
    // Updater funcional: selectMedicamento hace varias actualizaciones seguidas;
    // con el closure directo se pisaban entre sí y se perdía medicamentoId.
    setMedicamentos((prev) => prev.map((m) => m.key === key ? { ...m, [field]: value } : m));
  };

  const handleCieSearch = async (key: number, query: string) => {
    updateDiagnostico(key, 'cie10Search', query);
    if (query.trim().length < 3) return;
    try {
      const res = await diagnosticoService.searchCie10(query);
      setCieSearchResults({ ...cieSearchResults, [key]: res.data });
    } catch {
      setCieSearchResults({ ...cieSearchResults, [key]: [] });
    }
  };

  const selectCie = (key: number, item: CatalogoItem) => {
    updateDiagnostico(key, 'cie10Search', `${item.codigo} - ${item.descripcion}`);
    if (item.id !== undefined) updateDiagnostico(key, 'cie10Id', item.id);
    updateDiagnostico(key, 'descripcion', item.descripcion || '');
    setCieSearchResults({ ...cieSearchResults, [key]: [] });
  };

  const handleMedSearch = async (key: number, query: string) => {
    updateMedicamento(key, 'search', query);
    if (query.length < 2) return;
    try {
      const res = await recetaService.searchMedicamentos(query);
      setMedSearchResults({ ...medSearchResults, [key]: res.data });
    } catch {
      setMedSearchResults({ ...medSearchResults, [key]: [] });
    }
  };

  const selectMedicamento = (key: number, item: CatalogoItem) => {
    if (item.id === undefined) return;
    updateMedicamento(key, 'search', item.nombre ?? '');
    updateMedicamento(key, 'medicamentoId', item.id);
    updateMedicamento(key, 'medicamentoNombre', item.nombre ?? '');
    setMedSearchResults({ ...medSearchResults, [key]: [] });
  };

  const getPacienteNombre = () => {
    const id = Number(pacienteId);
    if (!id) return navState?.pacienteNombre || '';
    const p = pacientes?.find(x => x.id === id);
    return p ? `${p.nombre} ${p.apellido}` : navState?.pacienteNombre || '';
  };

  const getMedicoNombre = () => {
    const medId = watch('medicoId');
    if (!medId) return '';
    const m = medicos?.find(x => x.id === Number(medId));
    return m ? `Dr. ${m.nombre} ${m.apellido}` : '';
  };

  const getMedicoEspecialidad = () => {
    const medId = watch('medicoId');
    if (!medId) return '';
    const m = medicos?.find(x => x.id === Number(medId));
    return m?.especialidad?.nombre || '';
  };

  const handlePrintReport = async () => {
    toast('info', 'Generando PDF...');
    const { generarConsultaPdf } = await import('../utils/consulta-pdf');
    await generarConsultaPdf({
      paciente: getPacienteNombre(),
      medico: getMedicoNombre(),
      especialidad: getMedicoEspecialidad(),
      tipo: watch('esPrimeraVez') ? 'Primera vez' : watch('esContinuacion') ? 'Continuación' : 'Regular',
      turnoNumero: navState?.turnoNumero ? String(navState.turnoNumero) : undefined,
      motivoConsulta: watch('motivoConsulta'),
      sintomas: watch('sintomas'),
      enfermedadActual: watch('enfermedadActual'),
      examenFisico: watch('examenFisico'),
      evaluacion: watch('evaluacion'),
      planTratamiento: watch('planTratamiento'),
      indicaciones: watch('indicaciones'),
      signosVitales: [
        { label: 'Peso', value: watch('peso') ? `${watch('peso')} kg` : '' },
        { label: 'Talla', value: watch('talla') ? `${watch('talla')} cm` : '' },
        { label: 'Temperatura', value: watch('temperatura') ? `${watch('temperatura')}°C` : '' },
        { label: 'FC', value: watch('frecuenciaCardiaca') ? `${watch('frecuenciaCardiaca')} lpm` : '' },
        { label: 'FR', value: watch('frecuenciaRespiratoria') ? `${watch('frecuenciaRespiratoria')} rpm` : '' },
        { label: 'PA', value: watch('presionArterialSistolica') ? `${watch('presionArterialSistolica')}/${watch('presionArterialDiastolica') || '?'} mmHg` : '' },
        { label: 'SpO₂', value: watch('saturacionOxigeno') ? `${watch('saturacionOxigeno')}%` : '' },
        { label: 'Glucosa', value: watch('glucosaCapilar') ? `${watch('glucosaCapilar')} mg/dL` : '' },
      ],
      diagnosticos: diagnosticos.map((d) => ({
        descripcion: d.cie10Search || d.descripcion || '—',
        tipo: d.tipo,
        cronico: d.esCronico,
      })),
    });
    toast('success', 'PDF generado', 'Reporte descargado');
  };

  const verificarInteracciones = async () => {
    const ids = medicamentos
      .map((m) => m.medicamentoId)
      .filter((id): id is number => id != null);
    if (ids.length < 2) {
      toast('info', 'Agregue al menos 2 medicamentos');
      return;
    }
    try {
      const res = await interaccionService.verificar(ids);
      setInteraccionData(res.data || []);
      setInteraccionModalOpen(true);
    } catch {
      toast('error', 'Error', 'No se pudieron verificar las interacciones.');
    }
  };

  const handleEnmienda = async () => {
    setShowEnmiendaModal(false);
    setSubmitting(true);
    try {
      if (!enmiendaMotivo.trim()) {
        toast('error', 'Motivo requerido', 'Explique el motivo de la enmienda');
        setSubmitting(false);
        return;
      }
      if (!turnoId) {
        toast('error', 'Error', 'No se puede registrar la enmienda sin consulta asociada');
        setSubmitting(false);
        return;
      }
      await consultaCompletaService.crearNotaEnmienda(Number(turnoId), enmiendaMotivo);
      toast('success', 'Nota de enmienda registrada', 'La enmienda quedó documentada en el expediente (R.M. 0090)');
      reset();
      setDiagnosticos([]);
      setMedicamentos([]);
      setCitasPaciente([]);
      navigate('/consultas');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      const msg = err?.response?.data?.message;
      toast('error', 'Error', msg || 'No se pudo registrar la enmienda');
    } finally {
      setSubmitting(false);
    }
  };

  // Los campos obligatorios viven en pestañas distintas: si falta alguno,
  // se avisa en qué pestaña está en lugar de fallar en silencio.
  const CAMPO_TAB: Record<string, string> = {
    pacienteId: 'Paciente', medicoId: 'Médico',
    motivoConsulta: 'Motivo de consulta (S · Subjetivo)',
    examenFisico: 'Examen físico (O · Objetivo)',
    evaluacion: 'Evaluación (A · Evaluación)',
    planTratamiento: 'Plan de tratamiento (P · Plan)',
    incapacidadDias: 'Días de incapacidad (P · Plan)',
  };
  const onInvalid = (errs: Record<string, unknown>) => {
    const faltan = Object.keys(errs).map((k) => CAMPO_TAB[k] ?? k);
    toast('warning', 'Faltan datos obligatorios', faltan.join(' · '));
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      // Validación: debe haber al menos un diagnóstico CIE-10
      if (diagnosticos.length === 0) {
        toast('error', 'Consulta incompleta', 'Falta registrar el diagnóstico');
        setSubmitting(false);
        return;
      }
      // La nota de enmienda solo aplica cuando el backend rechaza la edición
      // por la ventana de inmutabilidad (409); una consulta nueva desde turno se guarda.
      const payload: ConsultaCompletaDto = {
        pacienteId: Number(data.pacienteId),
        medicoId: Number(data.medicoId),
        citaId: data.citaId ? Number(data.citaId) : undefined,
        motivoConsulta: data.motivoConsulta,
        sintomas: data.sintomas,
        enfermedadActual: data.enfermedadActual,
        examenFisico: data.examenFisico,
        peso: data.peso ? Number(data.peso) : undefined,
        talla: data.talla ? Number(data.talla) : undefined,
        temperatura: data.temperatura ? Number(data.temperatura) : undefined,
        frecuenciaCardiaca: data.frecuenciaCardiaca ? Number(data.frecuenciaCardiaca) : undefined,
        frecuenciaRespiratoria: data.frecuenciaRespiratoria ? Number(data.frecuenciaRespiratoria) : undefined,
        presionArterialSistolica: data.presionArterialSistolica ? Number(data.presionArterialSistolica) : undefined,
        presionArterialDiastolica: data.presionArterialDiastolica ? Number(data.presionArterialDiastolica) : undefined,
        saturacionOxigeno: data.saturacionOxigeno ? Number(data.saturacionOxigeno) : undefined,
        glucosaCapilar: data.glucosaCapilar ? Number(data.glucosaCapilar) : undefined,
        evaluacion: data.evaluacion,
        planTratamiento: data.planTratamiento,
        indicaciones: data.indicaciones,
        diagnosticos: diagnosticos.map((d) => ({
          cie10Id: d.cie10Id,
          descripcion: d.descripcion,
          tipo: d.tipo,
          esCronico: d.esCronico,
        })),
        recetas: medicamentos.map((m) => ({
          medicamentoId: m.medicamentoId!,
          dosis: m.dosis,
          frecuencia: m.frecuencia,
          duracion: m.duracion,
          cantidad: m.cantidad,
          observaciones: m.observaciones,
        })),
      };
      if (data.esContinuacion && data.consultaOriginalId) {
        await consultaCompletaService.continuar(Number(data.consultaOriginalId), payload);
      } else {
        await consultaCompletaService.createCompleta(payload);
      }
      toast('success', 'Consulta guardada', 'La consulta médica fue registrada exitosamente');
      if (turnoId) {
        await turnoService.updateEstado(turnoId, 'completado');
      }
      reset();
      setDiagnosticos([]);
      setMedicamentos([]);
      setCitasPaciente([]);
      if (turnoId) {
        navigate('/consultas');
        return;
      }
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
      const message = error?.response?.data?.message || error?.message || 'No se pudo guardar la consulta';
      if (status === 409) {
        setShowEnmiendaModal(true);
        setEnmiendaMensajeBackend(message);
        setSubmitting(false);
        return;
      }
      toast('error', 'Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in-up max-w-5xl mx-auto">
      <div className="flex items-center justify-between bg-[var(--bg-card)] rounded-lg border border-[var(--border-primary)] shadow-sm p-5">
        <div className="flex items-center gap-3">
          {turnoId && (
            <button onClick={() => navigate('/consultas')} className="p-2 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors">
              <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
            </button>
          )}
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-600)] text-white flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              {turnoId ? `Atención Turno #${navState?.turnoNumero ?? ''}` : 'Nueva Consulta'}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {turnoId ? `Paciente: ${navState?.pacienteNombre ?? ''}` : 'Registro de consulta médica'}
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={handlePrintReport}>
          <Printer className="w-4 h-4" /> Reporte
        </Button>
      </div>

      {navState?.pacienteId && (
        <BandaPaciente pacienteId={navState.pacienteId} />
      )}

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {/* Patient & Doctor Selection — compacto */}
        <Card title="Paciente y Médico" subtitle="Seleccione los participantes de la consulta" className="bg-[var(--bg-card)] dark:bg-[var(--bg-card)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select
              label="Paciente"
              required
              options={[
                { value: '', label: 'Seleccionar paciente...' },
                 ...(pacientes || []).map((p) => ({
                  value: String(p.id),
                  label: `${p.nombre} ${p.apellido} (${p.ci})`,
                })),
              ]}
              error={errors.pacienteId?.message as string}
              {...register('pacienteId', { required: 'El paciente es requerido' })}
            />
            <Select
              label="Médico"
              required
              options={[
                { value: '', label: 'Seleccionar médico...' },
                ...(medicos || []).map((m) => ({
                  value: String(m.id),
                  label: `Dr. ${m.nombre} ${m.apellido} - ${m.especialidad?.nombre || ''}`,
                })),
              ]}
              error={errors.medicoId?.message as string}
              {...register('medicoId', { required: 'El médico es requerido' })}
            />
            <Select
              label="Cita (opcional)"
              options={[
                { value: '', label: 'Sin cita asociada...' },
                ...(citasPaciente || []).map((c) => ({
                  value: String(c.id),
                  label: `${new Date(c.fecha).toLocaleDateString()} - Dr. ${c.medico?.nombre || ''}`,
                })),
              ]}
              {...register('citaId')}
            />
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox" className="rounded border-[var(--border-primary)] text-[var(--primary-600)] focus:ring-[var(--primary-500)]" {...register('esPrimeraVez')} />
              Es primera vez
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox" className="rounded border-[var(--border-primary)] text-[var(--primary-600)] focus:ring-[var(--primary-500)]" {...register('esContinuacion')} />
              Es continuación
            </label>
            {esContinuacion && (
              <Input
                label="ID Consulta original"
                type="number"
                className="max-w-[200px]"
                placeholder="ID..."
                {...register('consultaOriginalId')}
              />
            )}
          </div>
        </Card>

        {/* SOAP en pestañas — reduce la fatiga visual y la longitud vertical */}
        <Tabs
          variant="pills"
          defaultTab="subjetivo"
          tabs={[
            {
              id: 'subjetivo',
              label: 'S · Subjetivo',
              icon: <MessageSquareText className="w-4 h-4" style={{ color: 'var(--info-500)' }} />,
              content: (
                <div className="space-y-3 rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderLeft: '4px solid var(--info-500)' }}>
                  <Textarea label="Motivo de consulta" required placeholder="¿Por qué consulta el paciente?" rows={2} error={errors.motivoConsulta?.message as string} {...register('motivoConsulta', VALIDACION.MIN5)} />
                  <Textarea label="Síntomas" placeholder="Describa los síntomas del paciente..." rows={3} error={errors.sintomas?.message as string} {...register('sintomas')} />
                  <Textarea label="Enfermedad actual" placeholder="Historia de la enfermedad actual..." rows={3} error={errors.enfermedadActual?.message as string} {...register('enfermedadActual')} />
                </div>
              ),
            },
            {
              id: 'objetivo',
              label: 'O · Objetivo',
              icon: <HeartPulse className="w-4 h-4" style={{ color: 'var(--success-600)' }} />,
              content: (
                <div className="space-y-3 rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderLeft: '4px solid var(--success-500)' }}>
                  <VitalSignsGrid register={register} errors={errors} peso={peso} talla={talla} />
                  <Textarea label="Examen físico" required placeholder="Hallazgos del examen físico..." rows={3} error={errors.examenFisico?.message as string} {...register('examenFisico', VALIDACION.REQUIRED)} />
                </div>
              ),
            },
            {
              id: 'evaluacion',
              label: 'A · Evaluación',
              icon: <ClipboardList className="w-4 h-4" style={{ color: 'var(--warning-600)' }} />,
              content: (
                <div className="space-y-3 rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderLeft: '4px solid var(--warning-500)' }}>
                  <Textarea label="Evaluación" required placeholder="Evaluación del médico..." rows={3} error={errors.evaluacion?.message as string} {...register('evaluacion', VALIDACION.REQUIRED)} />
                  <DiagnosticoList
                    diagnosticos={diagnosticos}
                    onAdd={addDiagnostico}
                    onRemove={removeDiagnostico}
                    onUpdate={updateDiagnostico}
                    onCieSearch={handleCieSearch}
                    onSelectCie={selectCie}
                    cieSearchResults={cieSearchResults}
                  />
                </div>
              ),
            },
            {
              id: 'plan',
              label: 'P · Plan',
              icon: <Pill className="w-4 h-4" style={{ color: 'var(--accent-600)' }} />,
              content: (
                <div className="space-y-3 rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderLeft: '4px solid var(--accent-500)' }}>
                  <Textarea label="Plan de tratamiento" required placeholder="Describa el plan de tratamiento..." rows={2} error={errors.planTratamiento?.message as string} {...register('planTratamiento', VALIDACION.MIN5)} />
                  <Textarea label="Indicaciones" placeholder="Indicaciones para el paciente..." rows={2} {...register('indicaciones')} />
                  <MedicamentoList
                    medicamentos={medicamentos}
                    onAdd={addMedicamento}
                    onRemove={removeMedicamento}
                    onUpdate={updateMedicamento}
                    onMedSearch={handleMedSearch}
                    onSelectMed={selectMedicamento}
                    medSearchResults={medSearchResults}
                    onVerificarSeguridad={() => {
                      const id = Number(pacienteId);
                      if (!id) { toast('warning', 'Seleccione un paciente'); return; }
                      const ids = medicamentos.map(m => m.medicamentoId).filter((id): id is number => id != null);
                      if (ids.length === 0) { toast('info', 'Agregue al menos 1 medicamento'); return; }
                      setSafetyPacienteId(id);
                      setSafetyMedIds(ids);
                      setSafetyModalOpen(true);
                    }}
                    onVerificarInteracciones={verificarInteracciones}
                  />

                  {/* Próximo control e incapacidad — una sola fila compacta */}
                  <div className="pt-3 mt-1 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <Input label="Próximo control" type="date" {...register('proximoControl')} />
                      <Input label="Días de incapacidad" type="number" placeholder="Ej: 3" error={errors.incapacidadDias?.message as string} {...register('incapacidadDias', { ...VALIDACION.INCAPACIDAD })} />
                      <Input label="Inicio incapacidad" type="date" error={errors.incapacidadFechaInicio?.message as string} {...register('incapacidadFechaInicio')} />
                      <Input label="Fin incapacidad" type="date" error={errors.incapacidadFechaFin?.message as string} {...register('incapacidadFechaFin')} />
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />

        {/* Submit */}
        <div className="sticky bottom-4 flex justify-end z-20">
          <Button type="submit" size="lg" loading={submitting} className="shadow-lg">
            <FileText className="w-5 h-5 mr-2" />Guardar Consulta Completa
          </Button>
        </div>
      </form>

      <SafetyVerificationModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        pacienteId={safetyPacienteId}
        medicamentoIds={safetyMedIds}
      />

      {/* Modal Nota de Enmienda */}
      <Modal isOpen={showEnmiendaModal} onClose={() => setShowEnmiendaModal(false)} title="Nota de Enmienda" size="md">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {enmiendaMensajeBackend || 'La consulta tiene más de 24 horas. ¿Desea registrar una nota de enmienda en lugar de cerrar la consulta?'}
        </p>
        <div className="space-y-4">
          <Textarea
            label="Motivo de la enmienda"
            placeholder="Explique el motivo de la enmienda"
            rows={2}
            required
            value={enmiendaMotivo}
            onChange={e => setEnmiendaMotivo(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEnmiendaModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleEnmienda} loading={submitting}>
              <FileText className="w-4 h-5 mr-2" />Registrar Enmienda
            </Button>
          </div>
        </div>
      </Modal>

      {/* Interacciones Modal */}
      <Modal isOpen={interaccionModalOpen} onClose={() => setInteraccionModalOpen(false)} title="Interacciones Medicamentosas" size="lg">
        {interaccionData.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-[var(--success-100)] mx-auto mb-3" />
            <p className="text-lg font-semibold text-[var(--success-700)]">Sin interacciones</p>
            <p className="text-sm text-[var(--text-tertiary)]">No se encontraron interacciones entre los medicamentos seleccionados.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {[...interaccionData].sort((a, b) => {
              const order = ['contraindicada', 'severa', 'moderada', 'leve'];
              return order.indexOf(a.severidad ?? '') - order.indexOf(b.severidad ?? '');
            }).map((i, idx) => (
              <div key={idx} className="relative p-4 bg-[var(--bg-secondary)] rounded-lg border border-l-4" style={{ borderLeftColor: i.severidad === 'contraindicada' ? 'var(--danger-600)' : i.severidad === 'severa' ? 'var(--danger-500)' : i.severidad === 'moderada' ? 'var(--warning-500)' : 'var(--warning-500)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${i.severidad === 'contraindicada' ? 'bg-[var(--danger-600)]' : i.severidad === 'severa' ? 'bg-[var(--danger-500)]' : i.severidad === 'moderada' ? 'bg-[var(--warning-500)]' : 'bg-[var(--warning-500)]'}`}>
                    {i.severidad?.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{i.descripcion}</p>
                {i.efecto && <p className="text-sm text-[var(--text-tertiary)] mt-1">Efecto: {i.efecto}</p>}
                {i.recomendacion && <p className="text-sm text-[var(--text-tertiary)]">Recomendación: {i.recomendacion}</p>}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={() => setInteraccionModalOpen(false)}>Cerrar</Button>
        </div>
      </Modal>

    </div>
  );
}
