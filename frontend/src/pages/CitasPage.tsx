import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, XCircle, Calendar, UserRound, Stethoscope, CalendarDays, Clock, ChevronDown, CheckCircle2, AlertTriangle, Eye, Layers, Syringe, ListOrdered, RefreshCcw, UserCheck, Check, type LucideIcon } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Modal, Input, StatusBadge, citaEstadoToStatus, Card } from '../components/ui';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { toast } from '../components/ui/Toast';
import { useStore } from '../store';
import { citaService } from '../api/cita.service';
import { servicioService } from '../api/servicio.service';
import { tipoAtencionService } from '../api/tipoAtencion.service';
import type { Cita, Servicio, TipoAtencion } from '../types';

const campoBase = 'w-full border border-[var(--border-primary)] rounded-xl px-4 py-3 bg-[var(--bg-secondary)]/50 focus:bg-[var(--bg-card)] focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-600)] focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] transition-all duration-200 text-[var(--text-primary)] text-sm';

function FieldLabel({ icon: Icon, text, required }: { icon: LucideIcon; text: string; required?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
      <Icon className="w-3.5 h-3.5" />
      {text}
      {required && <span className="text-[var(--danger-500)]">*</span>}
    </span>
  );
}

type Slot = { horaInicio: string; horaFin: string; disponible: boolean; estado: string };

export default function CitasPage() {
  const { citas, fetchCitas, fetchPacientes, fetchMedicos, fetchEspecialidades, pacientes, medicos, especialidades, addCita, updateCita } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Cita | null>(null);
  const [detailTarget, setDetailTarget] = useState<Cita | null>(null);
  const [cancelMotivo, setCancelMotivo] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Reprogramar
  const [isReproModalOpen, setIsReproModalOpen] = useState(false);
  const [reproTarget, setReproTarget] = useState<Cita | null>(null);
  const [reproFecha, setReproFecha] = useState('');
  const [reproHora, setReproHora] = useState('');
  const [reproSlots, setReproSlots] = useState<Slot[]>([]);
  const [loadingReproSlots, setLoadingReproSlots] = useState(false);

  // Catálogos dinámicos
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [tiposAtencion, setTiposAtencion] = useState<TipoAtencion[]>([]);

  // Estado del formulario (cascada)
  const [selPaciente, setSelPaciente] = useState('');
  const [selTipoAtencion, setSelTipoAtencion] = useState('');
  const [selEspecialidad, setSelEspecialidad] = useState('');
  const [selServicio, setSelServicio] = useState('');
  const [selMedico, setSelMedico] = useState('');
  const [selFecha, setSelFecha] = useState('');
  const [selHora, setSelHora] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => { fetchCitas(); fetchPacientes(); fetchMedicos(); fetchEspecialidades(); }, []);
  useEffect(() => {
    tipoAtencionService.getAll().then((r: any) => setTiposAtencion(r.data || r)).catch(() => setTiposAtencion([]));
  }, []);

  // Cargar servicios de la especialidad seleccionada
  useEffect(() => {
    if (!selEspecialidad) { const t = setTimeout(() => { setServicios([]); setSelServicio(''); }, 0); return () => clearTimeout(t); }
    servicioService.getByEspecialidad(Number(selEspecialidad)).then((r: any) => {
      const list = Array.isArray(r.data) ? r.data : r;
      setServicios(list);
      setSelServicio('');
      setSelMedico('');
    }).catch(() => setServicios([]));
  }, [selEspecialidad]);

  // Médicos habilitados para la especialidad + servicio seleccionado
  const medicosFiltrados = useMemo(() => {
    let list = medicos || [];
    if (selEspecialidad) {
      list = list.filter((m) => String(m.especialidadId) === String(selEspecialidad));
    }
    if (selServicio) {
      // Solo médicos cuyo especialidadId coincide (la habilitación por servicio se valida en backend)
      list = list.filter((m) => String(m.especialidadId) === String(selEspecialidad));
    }
    return list;
  }, [medicos, selEspecialidad, selServicio]);

  // Cargar slots disponibles al seleccionar médico + fecha + servicio
  useEffect(() => {
    if (!selMedico || !selFecha || !selServicio) { const t = setTimeout(() => { setSlots([]); setSelHora(''); }, 0); return () => clearTimeout(t); }
    const tl = setTimeout(() => setLoadingSlots(true), 0);
    citaService.getSlots(Number(selMedico), selFecha, Number(selServicio))
      .then((r: any) => {
        const list = Array.isArray(r.data) ? r.data : r;
        setSlots(list);
        setSelHora('');
      })
      .catch(() => setSlots([]))
      .finally(() => { clearTimeout(tl); setLoadingSlots(false); });
  }, [selMedico, selFecha, selServicio]);

  const handleOpenModal = (cita?: Cita) => {
    setEditingCita(cita || null);
    setSelPaciente(cita ? String(cita.pacienteId) : '');
    setSelTipoAtencion(cita?.tipoAtencionId ? String(cita.tipoAtencionId) : '');
    setSelEspecialidad(cita?.especialidadId ? String(cita.especialidadId) : '');
    setSelServicio(cita?.servicioId ? String(cita.servicioId) : '');
    setSelMedico(cita ? String(cita.medicoId) : '');
    setSelFecha(cita ? cita.fecha.split('T')[0] : '');
    setSelHora(cita?.horaInicio || '');
    setSlots([]);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingCita(null); setSelPaciente(''); setSelTipoAtencion(''); setSelEspecialidad('');
    setSelServicio(''); setSelMedico(''); setSelFecha(''); setSelHora(''); setSlots([]);
  };

  const onSubmit = async () => {
    // Validaciones
    if (!selPaciente || !selTipoAtencion || !selEspecialidad || !selServicio || !selMedico || !selFecha || !selHora) {
      const faltantes = [
        !selPaciente && 'Paciente',
        !selTipoAtencion && 'Tipo de atención',
        !selEspecialidad && 'Especialidad',
        !selServicio && 'Servicio',
        !selMedico && 'Médico',
        !selFecha && 'Fecha',
        !selHora && 'Hora',
      ].filter(Boolean) as string[];
      toast('error', 'Faltan datos para agendar la cita', `Complete el/los paso(s): ${faltantes.join(', ')}`);
      return;
    }
    setFormLoading(true);
    try {
      const fechaCompleta = new Date(`${selFecha}T${selHora}`).toISOString();
      const payload = {
        pacienteId: Number(selPaciente),
        medicoId: Number(selMedico),
        especialidadId: Number(selEspecialidad),
        servicioId: Number(selServicio),
        tipoAtencionId: Number(selTipoAtencion),
        fecha: fechaCompleta,
        horaInicio: selHora,
      };
      if (editingCita?.id) {
        await updateCita(editingCita.id, payload);
        toast('success', 'Cita actualizada');
      } else {
        await addCita(payload as any);
        toast('success', 'Cita agendada');
      }
      setIsModalOpen(false); resetForm(); fetchCitas();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      toast('error', 'No se pudo guardar la cita', Array.isArray(msg) ? msg.join(' · ') : (msg || 'Revise los datos e intente nuevamente'));
    } finally { setFormLoading(false); }
  };

  const openCancelModal = (cita: Cita) => {
    setCancelTarget(cita); setCancelMotivo(''); setIsCancelModalOpen(true);
  };

  const handleCancelar = async () => {
    if (!cancelTarget?.id) return;
    setFormLoading(true);
    try {
      await citaService.cancel(cancelTarget.id, cancelMotivo || 'Sin motivo');
      toast('success', 'Cita cancelada', 'Se liberó el horario');
      setIsCancelModalOpen(false); setCancelTarget(null); fetchCitas();
    } catch { toast('error', 'Error al cancelar'); } finally { setFormLoading(false); }
  };

  const registrarLlegada = async (cita: Cita) => {
    const esHoy = new Date(cita.fecha).toDateString() === new Date().toDateString();
    const esPendienteOConfirmada = cita.estado?.nombre === 'pendiente' || cita.estado?.nombre === 'confirmada';
    if (!esHoy) { toast('error', 'No se puede registrar llegada', 'Solo citas de hoy'); return; }
    if (!esPendienteOConfirmada) { toast('error', 'No se puede registrar llegada', 'La cita no está pendiente o confirmada'); return; }
    try {
      const r = await citaService.llegada(cita.id!) as any;
      toast('success', `Turno emitido`, `N° ${r.data?.numero ?? ''}`);
      fetchCitas();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast('error', 'Error al registrar llegada', err?.response?.data?.message || 'Revise los datos');
    }
  };

  const abrirReprogramar = (cita: Cita) => {
    setReproTarget(cita);
    setReproFecha('');
    setReproHora('');
    setReproSlots([]);
    setIsReproModalOpen(true);
  };

  const cargarReproSlots = (fecha: string) => {
    setReproFecha(fecha);
    setReproHora('');
    if (!reproTarget?.medicoId || !fecha) { setReproSlots([]); return; }
    setLoadingReproSlots(true);
    citaService.getSlots(reproTarget.medicoId, fecha, reproTarget.servicioId)
      .then((r: any) => { const list = Array.isArray(r.data) ? r.data : r; setReproSlots(list); })
      .catch(() => setReproSlots([]))
      .finally(() => setLoadingReproSlots(false));
  };

  const confirmarReprogramar = async () => {
    if (!reproTarget?.id || !reproFecha || !reproHora) { toast('error', 'Seleccione fecha y hora'); return; }
    setFormLoading(true);
    try {
      await citaService.reprogramar(reproTarget.id, { fecha: `${reproFecha}T${reproHora}`, horaInicio: reproHora, servicioId: reproTarget.servicioId });
      toast('success', 'Cita reprogramada', 'El horario fue actualizado y revalidado');
      setIsReproModalOpen(false); setReproTarget(null); fetchCitas();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast('error', 'No se pudo reprogramar', err?.response?.data?.message || 'Verifique la disponibilidad');
    } finally { setFormLoading(false); }
  };

  const columns: Column<Cita>[] = [
    { key: 'fecha', header: 'Fecha y Hora', sortable: true, render: (c) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-[var(--text-primary)]">{new Date(c.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span className="text-xs text-[var(--text-secondary)]">{c.horaInicio || new Date(c.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    )},
    { key: 'paciente', header: 'Paciente', sortable: true, render: (c) => {
      const p = c.paciente || (pacientes || []).find(x => x.id === c.pacienteId);
      return <span className="font-medium text-[var(--text-primary)]">{p ? `${p.nombre} ${p.apellido}` : '—'}</span>;
    } },
    { key: 'especialidad', header: 'Especialidad', render: (c) => {
      const e = c.especialidad || (especialidades || []).find(x => x.id === c.especialidadId);
      return <span className="text-[var(--text-secondary)]">{e?.nombre || '—'}</span>;
    } },
    { key: 'servicio', header: 'Servicio', render: (c) => {
      const s = c.servicio || servicios.find(x => x.id === c.servicioId);
      return <span className="text-[var(--text-secondary)]">{s?.nombre || '—'}</span>;
    } },
    { key: 'medico', header: 'Médico', render: (c) => {
      const m = c.medico || (medicos || []).find(x => x.id === c.medicoId);
      return <span className="text-[var(--text-secondary)]">{m ? `Dr. ${m.nombre} ${m.apellido}` : '—'}</span>;
    } },
    { key: 'estado', header: 'Estado', render: (c) => {
      const est = c.estado?.nombre || 'pendiente';
      return <StatusBadge variant={citaEstadoToStatus(c.estadoId)} dot={c.estado?.nombre === 'en_curso'}>{est.charAt(0).toUpperCase() + est.slice(1)}</StatusBadge>;
    } },
    { key: 'acciones', header: 'Acciones', align: 'right', render: (c) => (
      <div className="flex justify-end gap-1">
        <button onClick={() => { setDetailTarget(c); setIsDetailModalOpen(true); }} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--primary-600)] hover:bg-[var(--primary-50)]" title="Ver detalle"><Eye className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleOpenModal(c)} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]" title="Editar"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => openCancelModal(c)} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--danger-500)] hover:bg-[var(--danger-50)]" title="Cancelar"><XCircle className="w-3.5 h-3.5" /></button>
        {c.estado?.nombre === 'pendiente' || c.estado?.nombre === 'confirmada' ? (
          <button onClick={() => registrarLlegada(c)} className="p-1.5 rounded-md text-[var(--success-600)] hover:text-[var(--success-700)] hover:bg-[var(--success-50)]" title="Registrar llegada"><UserCheck className="w-3.5 h-3.5" /></button>
        ) : null}
        {c.estado?.nombre === 'pendiente' || c.estado?.nombre === 'confirmada' ? (
          <button onClick={() => abrirReprogramar(c)} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--accent-500)] hover:bg-[var(--accent-50)]" title="Reprogramar"><RefreshCcw className="w-3.5 h-3.5" /></button>
        ) : null}
      </div>
    )},
  ];

  const hoy = citas.filter(c => new Date(c.fecha).toDateString() === new Date().toDateString());

  const flowSteps = [
    { icon: UserRound, label: 'Paciente', value: selPaciente },
    { icon: ListOrdered, label: 'Tipo de atención', value: selTipoAtencion },
    { icon: Layers, label: 'Especialidad', value: selEspecialidad },
    { icon: Syringe, label: 'Servicio', value: selServicio },
    { icon: Stethoscope, label: 'Médico', value: selMedico },
    { icon: CalendarDays, label: 'Fecha', value: selFecha },
    { icon: Clock, label: 'Horario', value: selHora },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Calendar}
        title="Citas"
        subtitle="Agendamiento con flujo completo y validación de disponibilidad"
        stats={[{ label: 'Total', value: citas.length }, { label: 'Hoy', value: hoy.length }]}
        action={<Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4" />Nueva Cita</Button>}
      />

      <Card padding={false}>
        <DataTable columns={columns} data={citas} keyExtractor={(c) => c.id!}
          searchPlaceholder="Buscar por paciente, servicio o médico..."
          emptyMessage="No hay citas registradas"
          searchKeys={['paciente.nombre', 'paciente.apellido', 'medico.nombre', 'servicio.nombre', 'especialidad.nombre', 'motivo']}
          className="table-premium"
          filters={[{
            key: 'estado',
            label: 'Estado',
            options: [...new Set(citas.map(c => c.estado?.nombre).filter(Boolean))].map(n => ({ value: n as string, label: n as string })),
            predicate: (c, v) => c.estado?.nombre === v,
          }]} />
      </Card>

      {/* Modal Nueva/Editar Cita con flujo en cascada */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingCita ? 'Editar Cita' : 'Nueva Cita'} size="xl" accent="primary">
        {/* Barra de pasos (stepper) */}
        <div className="flex flex-wrap items-center gap-2 mb-6 px-1">
          {flowSteps.map((s, i) => {
            const done = Boolean(s.value);
            return (
              <div key={s.label} className="flex items-center gap-1.5">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                    done
                      ? 'bg-[var(--success-50)] text-[var(--success-700)]'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                  }`}
                >
                  {done ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full bg-[var(--border-primary)] text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  )}
                  <span className="text-[11px] font-semibold">{s.label}</span>
                </div>
                {i < flowSteps.length - 1 && <ChevronDown className="w-3 h-3 -rotate-90 text-[var(--text-tertiary)] hidden md:block" />}
              </div>
            );
          })}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
          {/* Paso 1: Paciente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel icon={UserRound} text="Paciente" required />
              <div className="relative">
                <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                <select className={`${campoBase} pl-10 pr-10 appearance-none cursor-pointer`} value={selPaciente} onChange={e => setSelPaciente(e.target.value)}>
                  <option value="" disabled>Seleccionar paciente...</option>
                  {(pacientes || []).map(p => (
                    <option key={p.id} value={String(p.id)}>{`${p.nombre} ${p.apellido}${p.ci ? ` · CI ${p.ci}` : ''}`}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
              </div>
            </div>

            {/* Paso 2: Tipo de atención */}
            <div>
              <FieldLabel icon={ListOrdered} text="Tipo de atención" required />
              <div className="grid grid-cols-2 gap-2">
                {tiposAtencion.filter(t => t.activo !== false).map(t => (
                  <button key={t.id} type="button" onClick={() => setSelTipoAtencion(String(t.id))}
                    className={`px-3 py-3 rounded-xl border text-sm font-medium transition-all ${selTipoAtencion === String(t.id) ? 'border-[var(--primary-600)] bg-[var(--primary-50)] text-[var(--primary-700)]' : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}>
                    <span className="block">{t.nombre}</span>
                    <span className={`block text-[10px] mt-0.5 font-semibold ${t.tipo === 'reconsulta' ? 'text-[var(--accent-600)]' : 'text-[var(--text-tertiary)]'}`}>
                      {t.tipo === 'reconsulta' ? 'Reconsulta' : 'Consulta nueva'}
                    </span>
                  </button>
                ))}
                {tiposAtencion.length === 0 && <span className="text-xs text-[var(--text-tertiary)] col-span-2">No hay tipos de atención configurados</span>}
              </div>
              {selTipoAtencion && (() => {
                const ta = tiposAtencion.find(t => String(t.id) === selTipoAtencion);
                if (ta?.tipo !== 'reconsulta') return null;
                return (
                  <div className="mt-2 p-3 rounded-lg bg-[var(--accent-50)] border border-[var(--accent-100)] text-sm text-[var(--accent-700)] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Reconsulta: el paciente ha sido atendido previamente en esta especialidad. El monto y duración pueden diferir de la consulta nueva.</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Paso 3: Especialidad */}
          <div>
            <FieldLabel icon={Layers} text="Especialidad" required />
            <div className="relative">
              <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
              <select className={`${campoBase} pl-10 pr-10 appearance-none cursor-pointer`} value={selEspecialidad} onChange={e => setSelEspecialidad(e.target.value)}>
                <option value="" disabled>Seleccionar especialidad...</option>
                {(especialidades || []).map(e => (
                  <option key={e.id} value={String(e.id)}>{e.nombre}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
            </div>
          </div>

          {/* Paso 4: Servicio */}
          <div>
            <FieldLabel icon={Syringe} text="Servicio" required />
            {servicios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {servicios.map(s => (
                  <button key={s.id} type="button" onClick={() => setSelServicio(String(s.id))}
                    className={`p-3 rounded-xl border text-left transition-all ${selServicio === String(s.id) ? 'border-[var(--primary-600)] bg-[var(--primary-50)]' : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-tertiary)]'}`}>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{s.nombre}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Bs. {Number(s.monto).toFixed(2)} · {s.duracionMinutos} min
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)]">Seleccione primero una especialidad</p>
            )}
          </div>

          {/* Paso 5: Médico */}
          <div>
            <FieldLabel icon={Stethoscope} text="Médico" required />
            {medicosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {medicosFiltrados.map(m => (
                  <button key={m.id} type="button" onClick={() => setSelMedico(String(m.id))}
                    className={`p-3 rounded-xl border text-left transition-all ${selMedico === String(m.id) ? 'border-[var(--primary-600)] bg-[var(--primary-50)]' : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-tertiary)]'}`}>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">Dr. {m.nombre} {m.apellido}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">{m.especialidad?.nombre || '—'}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)]">Seleccione primero especialidad y servicio</p>
            )}
          </div>

          {/* Paso 6: Fecha */}
          <div>
            <FieldLabel icon={CalendarDays} text="Fecha" required />
            <input type="date" className={campoBase} value={selFecha} min={new Date().toISOString().split('T')[0]}
              onChange={e => { setSelFecha(e.target.value); setSelHora(''); }} />
          </div>

          {/* Paso 7: Horario (slots) */}
          <div>
            <FieldLabel icon={Clock} text="Horario disponible" required />
            {loadingSlots && <p className="text-xs text-[var(--text-tertiary)]">Cargando horarios...</p>}
            {!selMedico || !selFecha || !selServicio ? (
              <p className="text-xs text-[var(--text-tertiary)]">Seleccione médico, fecha y servicio para ver los horarios disponibles</p>
            ) : slots.length === 0 && !loadingSlots ? (
              <p className="text-xs text-[var(--danger-500)] font-medium">El médico no tiene horarios disponibles para esta fecha</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {slots.map(s => {
                  const selected = selHora === s.horaInicio;
                  const disabled = !s.disponible;
                  return (
                    <button key={s.horaInicio} type="button" disabled={disabled} onClick={() => setSelHora(s.horaInicio)}
                      className={`p-2.5 rounded-lg border text-sm font-medium transition-all ${selected ? 'border-[var(--primary-600)] bg-[var(--primary-600)] text-white' : disabled ? 'border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed line-through' : 'border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--primary-400)]'}`}>
                      {s.horaInicio}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resumen */}
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-primary)] grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="block text-xs text-[var(--text-tertiary)]">Paciente</span><span className="font-semibold text-[var(--text-primary)]">{(pacientes||[]).find(p => String(p.id) === selPaciente)?.nombre || '—'}</span></div>
            <div><span className="block text-xs text-[var(--text-tertiary)]">Servicio</span><span className="font-semibold text-[var(--text-primary)]">{servicios.find(s => String(s.id) === selServicio)?.nombre || '—'}</span></div>
            <div><span className="block text-xs text-[var(--text-tertiary)]">Médico</span><span className="font-semibold text-[var(--text-primary)]">{(medicos||[]).find(m => String(m.id) === selMedico)?.apellido || '—'}</span></div>
            <div><span className="block text-xs text-[var(--text-tertiary)]">Hora</span><span className="font-semibold text-[var(--text-primary)]">{selFecha ? `${selFecha} ${selHora}` : '—'}</span></div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-[var(--border-secondary)]">
            <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] active:scale-[0.98] transition-all duration-200">
              Cancelar
            </button>
            <button type="submit" disabled={formLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--primary-600)] text-white text-sm font-semibold hover:bg-[var(--primary-700)] hover:shadow-lg hover:shadow-primary-600/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
              {formLoading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <CheckCircle2 className="w-4 h-4" />}
              {editingCita ? 'Actualizar Cita' : 'Crear Cita'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle de Cita */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detalle de Cita" size="md" accent="primary">
        {detailTarget && (() => {
          const p = detailTarget.paciente || (pacientes||[]).find(x => x.id === detailTarget.pacienteId);
          const m = detailTarget.medico || (medicos||[]).find(x => x.id === detailTarget.medicoId);
          const e = detailTarget.especialidad || (especialidades||[]).find(x => x.id === detailTarget.especialidadId);
          const s = detailTarget.servicio || servicios.find(x => x.id === detailTarget.servicioId);
          const ta = detailTarget.tipoAtencion || tiposAtencion.find(x => x.id === detailTarget.tipoAtencionId);
          const duracion = s?.duracionMinutos || 30;
          return (
            <div className="space-y-3 text-sm">
              {[
                ['Paciente', `${p?.nombre || ''} ${p?.apellido || ''}`],
                ['Tipo', ta ? `${ta.nombre}${ta.tipo === 'reconsulta' ? ' (Reconsulta)' : ''}` : '—'],
                ['Especialidad', e?.nombre || '—'],
                ['Servicio', s?.nombre || '—'],
                ['Médico', m ? `Dr. ${m.nombre} ${m.apellido}` : '—'],
                ['Fecha', new Date(detailTarget.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })],
                ['Hora', detailTarget.horaInicio || '—'],
                ['Duración', `${duracion} minutos`],
                ['Costo', `Bs. ${Number(s?.monto || 0).toFixed(2)}`],
                ['Estado', detailTarget.estado?.nombre || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-[var(--border-secondary)] last:border-0">
                  <span className="text-[var(--text-tertiary)]">{k}</span>
                  <span className="font-semibold text-right text-[var(--text-primary)]">{v}</span>
                </div>
              ))}
              <div className="flex justify-end pt-3">
                <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>Cerrar</Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Modal Cancelar */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancelar Cita" size="sm" hasUnsavedChanges={cancelMotivo.trim().length > 0} unsavedTitle="Motivo escrito" unsavedMessage="Escribió un motivo de cancelación que no se guardará. ¿Salir de todos modos?">
        {cancelTarget && (
          <div className="space-y-5">
            <div className="p-4 bg-[var(--danger-50)] rounded-lg border border-[var(--danger-100)] space-y-2">
              <p className="text-sm font-medium text-red-800">{cancelTarget.paciente?.nombre} {cancelTarget.paciente?.apellido}</p>
              <p className="text-xs text-[var(--danger-600)]">
                {new Date(cancelTarget.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}{cancelTarget.horaInicio}{' · Dr. '}{cancelTarget.medico?.nombre} {cancelTarget.medico?.apellido}
              </p>
            </div>
            <p className="text-xs text-[var(--danger-600)]">Esta acción cancelará la cita, liberará el horario y quedará registrada para auditoría.</p>
            <Input label="Motivo de cancelación *" value={cancelMotivo} onChange={e => setCancelMotivo(e.target.value)} placeholder="Ej: El paciente solicitó reagendar..." />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>Volver</Button>
              <Button variant="danger" onClick={handleCancelar} loading={formLoading} disabled={!cancelMotivo}>
                <XCircle className="w-4 h-4" /> Cancelar Cita
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Reprogramar */}
      <Modal isOpen={isReproModalOpen} onClose={() => setIsReproModalOpen(false)} title="Reprogramar Cita" size="md" accent="primary">
        {reproTarget && (() => {
          const s = reproTarget.servicio || servicios.find(x => x.id === reproTarget.servicioId);
          return (
            <div className="space-y-5">
              <div className="p-4 bg-[var(--bg-secondary)]/60 rounded-lg border border-[var(--border-primary)] text-sm space-y-1">
                <p className="font-medium text-[var(--text-primary)]">{reproTarget.paciente?.nombre} {reproTarget.paciente?.apellido}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Actual: {new Date(reproTarget.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} · {reproTarget.horaInicio || '—'} · {s?.nombre || '—'}
                </p>
              </div>

              <div>
                <FieldLabel icon={CalendarDays} text="Nueva fecha" required />
                <input type="date" className={campoBase} value={reproFecha}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => cargarReproSlots(e.target.value)} />
              </div>

              <div>
                <FieldLabel icon={Clock} text="Nuevo horario" required />
                {loadingReproSlots && <p className="text-xs text-[var(--text-tertiary)]">Cargando horarios...</p>}
                {!reproFecha ? (
                  <p className="text-xs text-[var(--text-tertiary)]">Seleccione una nueva fecha para ver los horarios disponibles</p>
                ) : reproSlots.length === 0 && !loadingReproSlots ? (
                  <p className="text-xs text-[var(--danger-500)] font-medium">Sin horarios disponibles para esa fecha</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {reproSlots.map(slot => {
                      const selected = reproHora === slot.horaInicio;
                      const disabled = !slot.disponible;
                      return (
                        <button key={slot.horaInicio} type="button" disabled={disabled} onClick={() => setReproHora(slot.horaInicio)}
                          className={`p-2 rounded-lg border text-sm font-medium transition-all ${selected ? 'border-[var(--primary-600)] bg-[var(--primary-600)] text-white' : disabled ? 'border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed line-through' : 'border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--primary-400)]'}`}>
                          {slot.horaInicio}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-secondary)]">
                <Button variant="secondary" onClick={() => setIsReproModalOpen(false)}>Cancelar</Button>
                <Button variant="primary" onClick={confirmarReprogramar} loading={formLoading} disabled={!reproFecha || !reproHora}>
                  <RefreshCcw className="w-4 h-4" /> Reprogramar
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
