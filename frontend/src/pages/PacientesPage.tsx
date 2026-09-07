import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Power, X, Circle, AlertTriangle, Ban, Skull, Archive, ChevronDown, Check, FolderOpen, type LucideIcon } from 'lucide-react';
import { Button, Modal, Input, Select, FormSection, ConfirmDialog } from '../components/ui';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { toast } from '../components/ui/Toast';
import { useStore } from '../store';
import { useForm } from 'react-hook-form';
import type { Paciente, EstadoPaciente } from '../types';

const ESTADOS: { value: EstadoPaciente; label: string; icon: LucideIcon; badge: string; dot: string }[] = [
  { value: 'activo', label: 'Activo', icon: Circle, badge: 'bg-[var(--success-50)] text-[var(--success-700)] border-[var(--success-200/60)]/60', dot: 'bg-[var(--success-500)]' },
  { value: 'inactivo', label: 'Inactivo', icon: AlertTriangle, badge: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-500' },
  { value: 'suspendido', label: 'Suspendido', icon: Ban, badge: 'bg-[var(--danger-50)] text-[var(--danger-700)] border-[var(--danger-200/60)]/60', dot: 'bg-[var(--danger-500)]' },
  { value: 'fallecido', label: 'Fallecido', icon: Skull, badge: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-primary)]', dot: 'bg-[var(--neutral-400)]' },
  { value: 'archivado', label: 'Archivado', icon: Archive, badge: 'bg-[var(--primary-50)] text-[var(--primary-700)] border-[var(--primary-200)]', dot: 'bg-[var(--primary-500)]' },
];

export default function PacientesPage() {
  const navigate = useNavigate();
  const { pacientes, fetchPacientes, fetchHelpers, generos, gruposSanguineos, addPaciente, updatePaciente } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [estadoTarget, setEstadoTarget] = useState<Paciente | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoPaciente>('activo');
  const [motivoEstado, setMotivoEstado] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterGenero, setFilterGenero] = useState<string>('');
  const [showEstadoMenu, setShowEstadoMenu] = useState(false);
  const [showGeneroMenu, setShowGeneroMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmChangeState, setConfirmChangeState] = useState<number | null>(null);
  const [pacienteConfirmId, setPacienteConfirmId] = useState<number | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  useEffect(() => { fetchPacientes(); fetchHelpers(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowEstadoMenu(false);
        setShowGeneroMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const VALIDACIONES = {
    nombre: {
      required: 'Los nombres son requeridos',
      pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/, message: 'Solo letras y espacios, entre 2 y 50 caracteres' },
      validate: (value: string) => value.trim().length >= 2 || 'Ingrese al menos 2 caracteres',
    },
    apellido: {
      required: 'Los apellidos son requeridos',
      pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/, message: 'Solo letras y espacios, entre 2 y 50 caracteres' },
      validate: (value: string) => value.trim().length >= 2 || 'Ingrese al menos 2 caracteres',
    },
    ci: {
      required: 'La cédula de identidad es requerida',
      pattern: { value: /^\d{5,15}$/, message: 'La C.I. debe contener solo números, entre 5 y 15 dígitos' },
    },
    telefono: {
      pattern: { value: /^(\d{7,8})?$/, message: 'El teléfono debe tener entre 7 y 8 dígitos' },
    },
    email: {
      pattern: { value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato de correo inválido (ejemplo: correo@dominio.com)' },
    },
    fechaNacimiento: (() => {
      const ahora = new Date();
      return {
        required: 'La fecha de nacimiento es requerida',
        validate: (value: string) => {
          const d = new Date(value);
          if (d >= ahora) return 'La fecha no puede ser futura';
          const edad = (ahora.getTime() - d.getTime()) / 3.15576e10;
          if (edad > 120) return 'La fecha de nacimiento no es válida (máximo 120 años)';
          return true;
        },
      };
    })(),
    direccion: {
      minLength: { value: 5, message: 'La dirección debe tener al menos 5 caracteres' },
    },
  };

  // Validación de CI duplicado contra el listado cargado
  const ciDuplicada = (value: string) => {
    const dup = pacientes.find(p => p.ci === String(value).trim() && p.id !== editingPaciente?.id);
    return !dup || `Ya existe un paciente registrado con la C.I. ${value}`;
  };

  // HU-02: al detectar CI existente, ofrecer abrir el expediente ya registrado
  const ciActual = String(watch('ci') ?? '').trim();
  const pacienteDuplicado = ciActual.length >= 5 && pacientes.find(
    (p) => p.ci === ciActual && p.id !== editingPaciente?.id,
  ) || null;

  const abrirExpedienteExistente = (id: number) => {
    setIsModalOpen(false);
    navigate(`/historia-clinica?paciente=${id}`);
  };

  const handleOpenModal = (paciente?: Paciente) => {
    setEditingPaciente(paciente || null);
    reset(paciente ? {
      nombre: paciente.nombre, apellido: paciente.apellido, ci: paciente.ci,
      fechaNacimiento: paciente.fechaNacimiento, generoId: paciente.generoId,
      telefono: paciente.telefono || '', direccion: paciente.direccion || '',
      email: paciente.email || '', grupoSanguineoId: paciente.grupoSanguineoId || '',
      contactoEmergenciaNombre: paciente.contactoEmergenciaNombre || '', contactoEmergenciaTelefono: paciente.contactoEmergenciaTelefono || '',
    } : { nombre: '', apellido: '', ci: '', fechaNacimiento: '', generoId: '', grupoSanguineoId: '', telefono: '', direccion: '', email: '', contactoEmergenciaNombre: '', contactoEmergenciaTelefono: '' });
    setIsModalOpen(true);
  };

  const openEstadoModal = (paciente: Paciente) => {
    setEstadoTarget(paciente);
    setNuevoEstado(paciente.estado || 'activo');
    setMotivoEstado('');
    setIsEstadoModalOpen(true);
  };

  const openEstadoModalById = (id: number) => {
    const paciente = pacientes.find((p) => p.id === id);
    if (paciente) {
      openEstadoModal(paciente);
    }
    setIsEstadoModalOpen(true);
  };

  const handleChangeEstado = async () => {
    if (!estadoTarget?.id) return;
    setFormLoading(true);
    try {
      await updatePaciente(estadoTarget.id, { estado: nuevoEstado });
      toast('success', 'Estado actualizado', `Paciente ${estadoTarget.nombre} ahora: ${nuevoEstado}`);
      setIsEstadoModalOpen(false);
      setEstadoTarget(null);
      fetchPacientes();
    } catch { toast('error', 'Error al cambiar estado'); } finally { setFormLoading(false); }
  };

  const onSubmit = async (data: Record<string, string>) => {
    setFormLoading(true);
    try {
      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        ci: data.ci,
        fechaNacimiento: data.fechaNacimiento,
        generoId: Number(data.generoId),
        telefono: data.telefono || undefined,
        direccion: data.direccion || undefined,
        email: data.email || undefined,
        grupoSanguineoId: data.grupoSanguineoId ? Number(data.grupoSanguineoId) : undefined,
        contactoEmergenciaNombre: data.contactoEmergenciaNombre || undefined,
        contactoEmergenciaTelefono: data.contactoEmergenciaTelefono || undefined,
      };
      if (editingPaciente?.id) {
        await updatePaciente(editingPaciente.id, payload);
        toast('success', 'Datos actualizados');
      } else {
        await addPaciente(payload);
        toast('success', 'Paciente registrado');
      }
      setIsModalOpen(false);
      fetchPacientes();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] }; status?: number } };
      const msg = err?.response?.data?.message;
      const textoMsg = Array.isArray(msg) ? msg.join(' · ') : (msg || '');
      if (err?.response?.status === 409 || textoMsg.includes('Ya existe un paciente')) {
        toast('warning', 'Paciente encontrado', 'Ya existe un expediente con esa C.I. Use "Abrir expediente existente" para no duplicar la historia clínica.');
      } else {
        toast('error', 'No se pudo guardar', textoMsg || 'Revise los datos e intente nuevamente');
      }
    } finally { setFormLoading(false); }
  };

  const estadoBadge = (estado?: EstadoPaciente) => {
    const e = ESTADOS.find(x => x.value === (estado || 'activo'));
    if (!e) return null;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${e.badge}`}>
        <span className="relative flex h-1.5 w-1.5">
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${e.dot}`} />
        </span>
        {e.label}
      </span>
    );
  };

  const columns: Column<Paciente>[] = [
    { key: 'nombreCompleto', header: 'Paciente', sortable: true, render: (p) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[var(--primary-50)] text-[var(--primary-600)] border border-[var(--primary-200)] flex items-center justify-center text-xs font-bold shrink-0">
          {p.nombre?.charAt(0)}{p.apellido?.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[var(--text-primary)] truncate">{p.nombre} {p.apellido}</p>
          <p className="text-xs text-[var(--text-tertiary)]">{p.genero?.nombre || (generos || []).find(g => g.id === p.generoId)?.nombre || '—'}</p>
        </div>
      </div>
    )},
    { key: 'ci', header: 'C.I.', sortable: true, render: (p) => (<span className="font-medium text-[var(--text-secondary)] tabular-nums">{p.ci}</span>) },
    { key: 'estado', header: 'Estado', render: (p) => estadoBadge(p.estado) },
    { key: 'telefono', header: 'Teléfono', render: (p) => (<span className="text-[var(--text-secondary)]">{p.telefono || '—'}</span>) },
    { key: 'acciones', header: 'Acciones', align: 'right', render: (p) => (
      <div className="flex justify-end gap-1">
        <button title="Editar paciente" onClick={() => handleOpenModal(p)} className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--primary-600)] hover:bg-[var(--primary-50)] active:scale-95 transition-all"><Pencil className="w-4 h-4" /></button>
        <button title="Cambiar estado" onClick={() => { setConfirmChangeState(p.id ?? null); setPacienteConfirmId(p.id ?? null); setShowConfirm(true); }} className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-amber-600 hover:bg-[var(--amber-50)] active:scale-95 transition-all"><Power className="w-4 h-4" /></button>
      </div>
    )},
  ];

  const pacientesFiltrados = pacientes.filter((p) => {
    if (filterEstado && p.estado !== filterEstado) return false;
    if (filterGenero && String(p.generoId) !== filterGenero) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header compacto */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-primary)]/80">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Padrón de Pacientes</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{pacientes.length} pacientes registrados en el sistema</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-xl bg-[var(--primary-600)] text-white text-sm font-semibold  hover:bg-[var(--primary-700)] hover:shadow-lg hover:shadow-primary-600/30 active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Nuevo Paciente
        </button>
      </div>

      {/* Toolbar de filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5" ref={filterRef}>
          {/* Estado */}
          <div className="relative">
            <button
              onClick={() => { setShowEstadoMenu(!showEstadoMenu); setShowGeneroMenu(false); }}
              className={`inline-flex items-center gap-2 pl-3.5 pr-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${filterEstado ? 'border-[var(--primary-300)] bg-[var(--primary-50)] text-[var(--primary-700)] shadow-sm' : 'border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--neutral-300)] hover:bg-[var(--bg-secondary)]'}`}
            >
              <span className={`w-2 h-2 rounded-full ${filterEstado ? ESTADOS.find(e => e.value === filterEstado)?.dot : 'bg-[var(--neutral-300)]'}`} />
              {ESTADOS.find(e => e.value === filterEstado)?.label || 'Estado'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showEstadoMenu ? 'rotate-180' : ''}`} />
            </button>
            {showEstadoMenu && (
              <div className="absolute z-40 mt-2 w-60 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shadow-xl py-1.5 origin-top-left animate-scale">
                <p className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Filtrar por estado</p>
                <button onClick={() => { setFilterEstado(''); setShowEstadoMenu(false); }} className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors">
                  <span className="text-[var(--text-primary)]">Todos los estados</span>
                  <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{pacientes.length}</span>
                </button>
                {ESTADOS.map(e => {
                  const Icon = e.icon;
                  const count = pacientes.filter(p => p.estado === e.value).length;
                  const active = filterEstado === e.value;
                  return (
                    <button key={e.value} onClick={() => { setFilterEstado(active ? '' : e.value); setShowEstadoMenu(false); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${active ? 'bg-[var(--primary-50)]' : 'hover:bg-[var(--bg-secondary)]'}`}>
                      <Icon className={`w-3.5 h-3.5 ${active ? 'text-[var(--primary-600)]' : 'text-[var(--text-tertiary)]'}`} />
                      <span className={`flex-1 text-left ${active ? 'font-semibold text-[var(--primary-700)]' : 'text-[var(--text-secondary)]'}`}>{e.label}</span>
                      <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{count}</span>
                      {active && <Check className="w-3.5 h-3.5 text-[var(--primary-600)]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Género */}
          <div className="relative">
            <button
              onClick={() => { setShowGeneroMenu(!showGeneroMenu); setShowEstadoMenu(false); }}
              className={`inline-flex items-center gap-2 pl-3.5 pr-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${filterGenero ? 'border-[var(--primary-300)] bg-[var(--primary-50)] text-[var(--primary-700)] shadow-sm' : 'border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--neutral-300)] hover:bg-[var(--bg-secondary)]'}`}
            >
              {(generos || []).find(g => String(g.id) === filterGenero)?.nombre || 'Género'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showGeneroMenu ? 'rotate-180' : ''}`} />
            </button>
            {showGeneroMenu && (
              <div className="absolute z-40 mt-2 w-52 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shadow-xl py-1.5 origin-top-left animate-scale">
                <p className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Filtrar por género</p>
                <button onClick={() => { setFilterGenero(''); setShowGeneroMenu(false); }} className="w-full px-4 py-2 text-sm text-left text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">Todos</button>
                {(generos || []).map(g => {
                  const active = filterGenero === String(g.id);
                  return (
                    <button key={g.id} onClick={() => { setFilterGenero(active ? '' : String(g.id)); setShowGeneroMenu(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${active ? 'bg-[var(--primary-50)]' : 'hover:bg-[var(--bg-secondary)]'}`}>
                      <span className={`flex-1 text-left ${active ? 'font-semibold text-[var(--primary-700)]' : 'text-[var(--text-secondary)]'}`}>{g.nombre}</span>
                      {active && <Check className="w-3.5 h-3.5 text-[var(--primary-600)]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chips de filtros activos */}
          {(filterEstado || filterGenero) && (
            <div className="flex flex-wrap items-center gap-2 ml-1">
              {filterEstado && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-full text-[var(--text-secondary)] shadow-sm">
                  Estado: {ESTADOS.find(x => x.value === filterEstado)?.label}
                  <button onClick={() => setFilterEstado('')} className="text-[var(--text-tertiary)] hover:text-[var(--danger-500)] transition-colors"><X className="w-3 h-3" /></button>
                </span>
              )}
              {filterGenero && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-full text-[var(--text-secondary)] shadow-sm">
                  Género: {(generos || []).find(g => String(g.id) === filterGenero)?.nombre}
                  <button onClick={() => setFilterGenero('')} className="text-[var(--text-tertiary)] hover:text-[var(--danger-500)] transition-colors"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={() => { setFilterEstado(''); setFilterGenero(''); }} className="text-xs font-semibold text-[var(--primary-600)] hover:text-[var(--primary-700)] hover:underline transition-colors">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        <span className="text-sm text-[var(--text-secondary)] whitespace-nowrap">
          <b className="text-[var(--text-primary)] tabular-nums">{pacientesFiltrados.length}</b> de {pacientes.length} pacientes
        </span>
      </div>

      <DataTable className="padron-table" columns={columns}
        data={pacientesFiltrados}
        keyExtractor={(p) => p.id!}
        searchPlaceholder="Buscar paciente por nombre, apellido o C.I...."
        searchKeys={['nombre', 'apellido', 'ci']}
        emptyMessage="Ningún paciente coincide con la búsqueda"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingPaciente ? 'Editar Paciente' : 'Nuevo Paciente'} size="lg">
        {editingPaciente && <p className="text-sm text-[var(--text-secondary)] mb-4">Editando: {editingPaciente.nombre} {editingPaciente.apellido} ({editingPaciente.ci})</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormSection title="Información Personal" color="indigo">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nombres *" placeholder="Primer y segundo nombre" error={errors.nombre?.message as string} {...register('nombre', VALIDACIONES.nombre)} />
              <Input label="Apellidos *" placeholder="Apellido paterno y materno" error={errors.apellido?.message as string} {...register('apellido', VALIDACIONES.apellido)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input label="C.I. *" placeholder="1234567 (solo números)" error={errors.ci?.message as string} {...register('ci', { ...VALIDACIONES.ci, validate: ciDuplicada })} />
              <Input label="Fecha de Nacimiento *" type="date" error={errors.fechaNacimiento?.message as string} {...register('fechaNacimiento', VALIDACIONES.fechaNacimiento)} />
            </div>
            {pacienteDuplicado && (
              <div className="mt-4 p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center gap-3"
                style={{ backgroundColor: 'var(--warning-50)', borderColor: 'var(--warning-300)' }}>
                <AlertTriangle className="w-5 h-5 shrink-0 hidden sm:block" style={{ color: 'var(--warning-600)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--warning-800)' }}>
                    Paciente encontrado · C.I. {pacienteDuplicado.ci}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--warning-700)' }}>
                    {pacienteDuplicado.nombre} {pacienteDuplicado.apellido} ya está registrado. No se creará un expediente duplicado.
                  </p>
                </div>
                <Button size="sm" onClick={() => abrirExpedienteExistente(pacienteDuplicado.id!)} className="shrink-0">
                  <FolderOpen className="w-4 h-4" />Abrir expediente existente
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select label="Género *" placeholder="Seleccionar..." options={(generos || []).map(g => ({ value: g.id, label: g.nombre }))} error={errors.generoId?.message as string} {...register('generoId', { required: 'El género es requerido' })} />
              <Select label="Grupo Sanguíneo" placeholder="Seleccionar..." options={(gruposSanguineos || []).map(g => ({ value: g.id, label: g.nombre }))} {...register('grupoSanguineoId')} />
            </div>
          </FormSection>
          <div className="border-t border-[var(--border-secondary)] pt-5">
            <FormSection title="Información de Contacto" color="emerald">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Teléfono" placeholder="77712345 (7-8 dígitos)" error={errors.telefono?.message as string} {...register('telefono', VALIDACIONES.telefono)} />
                <Input label="Email" type="email" placeholder="correo@ejemplo.com" error={errors.email?.message as string} {...register('email', VALIDACIONES.email)} />
              </div>
              <div className="mt-4">
                <Input label="Dirección" placeholder="Dirección completa (mín. 5 caracteres)" error={errors.direccion?.message as string} {...register('direccion', VALIDACIONES.direccion)} />
              </div>
            </FormSection>
          </div>
          <div className="border-t border-[var(--border-secondary)] pt-5">
            <FormSection title="Contacto de Emergencia" color="rose">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nombre del contacto" placeholder="Nombre y parentesco (ej. María Pérez, madre)" {...register('contactoEmergenciaNombre')} />
                <Input label="Teléfono del contacto" placeholder="77712345" {...register('contactoEmergenciaTelefono')} />
              </div>
            </FormSection>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-secondary)]">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={formLoading}>{editingPaciente ? 'Actualizar Paciente' : 'Registrar Paciente'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Cambiar estado de paciente"
        message={`¿Estás seguro de cambiar el estado del paciente ${pacienteConfirmId ? (pacientes.find(p => p.id === pacienteConfirmId)?.nombre + ' ' + pacientes.find(p => p.id === pacienteConfirmId)?.apellido) : ''}? Esta acción es irreversible y activará/desactivará el expediente.`}
        confirmText="Cambiar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={() => {
          setShowConfirm(false);
          if (confirmChangeState && pacienteConfirmId) {
            openEstadoModalById(pacienteConfirmId);
          }
        }}
      />

      <Modal isOpen={isEstadoModalOpen} onClose={() => setIsEstadoModalOpen(false)}
        title="Cambiar Estado del Paciente" size="sm">
        {estadoTarget && (
          <div className="space-y-5">
            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]/80">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{estadoTarget.nombre} {estadoTarget.apellido}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">CI: {estadoTarget.ci} · Estado actual: {estadoTarget.estado || 'activo'}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--text-primary)]">Nuevo estado:</p>
              <div className="grid grid-cols-1 gap-2">
                {ESTADOS.map(e => {
                  const Icon = e.icon;
                  const selected = nuevoEstado === e.value;
                  return (
                    <button
                      key={e.value}
                      type="button"
                      onClick={() => setNuevoEstado(e.value)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                        selected
                          ? 'border-[var(--neutral-900)] bg-[var(--bg-secondary)]'
                          : 'border-[var(--border-primary)] hover:border-[var(--neutral-300)] bg-[var(--bg-card)]'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${selected ? 'bg-[var(--bg-tertiary)]' : 'bg-[var(--bg-secondary)]'}`}>
                        <Icon className={`w-4 h-4 ${selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>{e.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <Input
              label="Motivo del cambio"
              value={motivoEstado}
              onChange={e => setMotivoEstado(e.target.value)}
              placeholder="Opcional: explique la razón del cambio de estado"
            />
            <p className="text-xs text-[var(--text-secondary)] italic">El paciente no podrá agendar nuevas citas si se marca como inactivo.</p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setIsEstadoModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleChangeEstado} loading={formLoading}>
                Cambiar a {ESTADOS.find(e => e.value === nuevoEstado)?.label}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
