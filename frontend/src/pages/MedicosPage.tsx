import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Stethoscope, Wrench, X, Check } from 'lucide-react';
import { Button, Modal, Input, Select, FormSection, StatusBadge, Card } from '../components/ui';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { toast } from '../components/ui/Toast';
import { useStore } from '../store';
import { medicoService } from '../api/medico.service';
import { servicioService } from '../api/servicio.service';
import { useForm } from 'react-hook-form';
import type { Medico, Servicio } from '../types';

const MEDICO_VALIDACIONES = {
  nombre: { required: 'El nombre es requerido', pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/, message: 'Solo letras, mínimo 2 caracteres' } },
  apellido: { required: 'El apellido es requerido', pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/, message: 'Solo letras, mínimo 2 caracteres' } },
  especialidadId: { required: 'La especialidad es requerida' },
  telefono: { pattern: { value: /^(\d{7,8})?$/, message: 'Teléfono inválido (7-8 dígitos)' } },
  email: { pattern: { value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato de email inválido' } },
};

export default function MedicosPage() {
  const { medicos, fetchMedicos, fetchEspecialidades, especialidades, addMedico, updateMedico, deleteMedico } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedico, setEditingMedico] = useState<Medico | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medico | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Servicios por médico
  const [serviciosModal, setServiciosModal] = useState(false);
  const [serviciosTarget, setServiciosTarget] = useState<Medico | null>(null);
  const [serviciosAsignados, setServiciosAsignados] = useState<any[]>([]);
  const [todosServicios, setTodosServicios] = useState<Servicio[]>([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [selServicioId, setSelServicioId] = useState<number | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchMedicos(); fetchEspecialidades(); }, []);

  const handleOpenModal = (medico?: Medico) => {
    setEditingMedico(medico || null);
    reset(medico ? { nombre: medico.nombre, apellido: medico.apellido, especialidadId: medico.especialidadId, telefono: medico.telefono || '', email: medico.email || '', consultorio: medico.consultorio || '' }
      : { nombre: '', apellido: '', especialidadId: '', telefono: '', email: '', consultorio: '' });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Record<string, string>) => {
    setFormLoading(true);
    try {
      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        especialidadId: Number(data.especialidadId),
        telefono: data.telefono || undefined,
        email: data.email || undefined,
        consultorio: data.consultorio || undefined,
      };
      if (editingMedico?.id) { await updateMedico(editingMedico.id, payload); toast('success', 'Médico actualizado'); }
      else { await addMedico(payload); toast('success', 'Médico registrado'); }
      setIsModalOpen(false); fetchMedicos();
    } catch { toast('error', 'Error al guardar'); } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    try { await deleteMedico(deleteTarget.id); toast('success', 'Médico eliminado'); setDeleteTarget(null); fetchMedicos(); }
    catch { toast('error', 'Error al eliminar'); } finally { setDeleteLoading(false); }
  };

  // ── CRUD Servicios por Médico ──
  const openServicios = async (medico: Medico) => {
    setServiciosTarget(medico);
    setServiciosModal(true);
    setLoadingServicios(true);
    try {
      const [asignadosRes, todosRes] = await Promise.all([
        medicoService.getServicios(medico.id!),
        servicioService.getAll(),
      ]);
      const asignados: any[] = Array.isArray((asignadosRes as any).data) ? (asignadosRes as any).data : (asignadosRes as any);
      const todos: Servicio[] = Array.isArray((todosRes as any).data) ? (todosRes as any).data : (todosRes as any);
      setServiciosAsignados(asignados);
      setTodosServicios(todos);
    } catch { toast('error', 'Error al cargar servicios'); }
    finally { setLoadingServicios(false); }
  };

  const assignServicio = async () => {
    if (!serviciosTarget || !selServicioId) return;
    try {
      await medicoService.assignServicio(serviciosTarget.id!, selServicioId);
      toast('success', 'Servicio asignado');
      setSelServicioId(null);
      openServicios(serviciosTarget);
    } catch (e: any) {
      toast('error', 'Error al asignar', e?.response?.data?.message || 'Ya asignado o error del servidor');
    }
  };

  const removeServicio = async (servicioId: number) => {
    if (!serviciosTarget) return;
    try {
      await medicoService.removeServicio(serviciosTarget.id!, servicioId);
      toast('success', 'Servicio removido');
      openServicios(serviciosTarget);
    } catch { toast('error', 'Error al remover'); }
  };

  const columns: Column<Medico>[] = [
    { key: 'nombreCompleto', header: 'Nombre', sortable: true, render: (m) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] flex items-center justify-center text-xs font-bold shrink-0">
          {m.nombre?.charAt(0)}{m.apellido?.charAt(0)}
        </div>
        <span className="font-medium text-[var(--text-primary)]">Dr. {m.nombre} {m.apellido}</span>
      </div>
    )},
    { key: 'especialidad', header: 'Especialidad', sortable: true, render: (m) => (<StatusBadge variant="info" size="sm">{m.especialidad?.nombre || ''}</StatusBadge>) },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'email', header: 'Email' },
    { key: 'consultorio', header: 'Consultorio', render: (m) => (<span className="text-[var(--text-secondary)]">{m.consultorio ? `Consultorio ${m.consultorio}` : '—'}</span>) },
    { key: 'servicios', header: 'Servicios', render: (m) => (
      <button onClick={() => openServicios(m)} className="text-xs text-[var(--primary-600)] hover:text-[var(--primary-700)] hover:underline font-medium flex items-center gap-1" title="Gestionar servicios">
        <Wrench className="w-3 h-3" /> Gestionar
      </button>
    )},
    { key: 'acciones', header: 'Acciones', align: 'right', render: (m) => (
      <div className="flex justify-end gap-1">
        <button onClick={() => handleOpenModal(m)} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => setDeleteTarget(m)} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--danger-500)] hover:bg-[var(--danger-50)]"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Stethoscope}
        title="Médicos"
        subtitle="Directorio médico y especialidades"
        stats={[{ label: 'Activos', value: medicos.length }]}
        action={<Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4" />Nuevo Médico</Button>}
      />

      <Card padding={false}>
        <DataTable className="table-premium" columns={columns} data={medicos} keyExtractor={(m) => m.id!}
          searchPlaceholder="Buscar por nombre o especialidad..." searchKeys={['nombre', 'apellido', 'especialidad.nombre']}
          filters={[{
            key: 'especialidad',
            label: 'Especialidad',
            options: [...new Set(medicos.map(m => m.especialidad?.nombre).filter(Boolean))].map(n => ({ value: n as string, label: n as string })),
            predicate: (m, v) => m.especialidad?.nombre === v,
          }]} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingMedico ? 'Editar Médico' : 'Nuevo Médico'} size="md">
        {editingMedico && <p className="text-sm text-[var(--text-secondary)] mb-4">Editando: {editingMedico.nombre} {editingMedico.apellido}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormSection title="Información Personal" color="emerald">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nombre" placeholder="Nombre (solo letras)" required error={errors.nombre?.message as string} {...register('nombre', MEDICO_VALIDACIONES.nombre)} />
              <Input label="Apellido" placeholder="Apellido (solo letras)" required error={errors.apellido?.message as string} {...register('apellido', MEDICO_VALIDACIONES.apellido)} />
            </div>
            <div className="mt-4">
              <Select label="Especialidad" placeholder="Seleccionar..." required options={(especialidades || []).map(e => ({ value: e.id, label: e.nombre }))} error={errors.especialidadId?.message as string} {...register('especialidadId', MEDICO_VALIDACIONES.especialidadId)} />
            </div>
          </FormSection>
          <div className="border-t border-[var(--border-secondary)] pt-5">
            <FormSection title="Información de Contacto" color="emerald">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Teléfono" placeholder="77712345 (7-8 dígitos)" error={errors.telefono?.message as string} {...register('telefono', MEDICO_VALIDACIONES.telefono)} />
                <Input label="Email" type="email" placeholder="correo@ejemplo.com" error={errors.email?.message as string} {...register('email', MEDICO_VALIDACIONES.email)} />
                <Input label="Consultorio" placeholder="Ej: 1, 2, 3..." {...register('consultorio')} />
              </div>
            </FormSection>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-secondary)]">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={formLoading}>{editingMedico ? 'Actualizar Médico' : 'Registrar Médico'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Eliminar Médico" message={`¿Está seguro de eliminar a ${deleteTarget?.nombre} ${deleteTarget?.apellido}?`}
        confirmText="Eliminar" variant="danger" loading={deleteLoading} />

      {/* Modal Servicios por Médico */}
      <Modal isOpen={serviciosModal} onClose={() => { setServiciosModal(false); setServiciosTarget(null); setServiciosAsignados([]); }}
        title={`Servicios de ${serviciosTarget?.nombre ?? ''} ${serviciosTarget?.apellido ?? ''}`} size="md" accent="primary">
        {loadingServicios ? (
          <p className="text-sm text-[var(--text-tertiary)]">Cargando servicios...</p>
        ) : (
          <div className="space-y-4">
            {/* Asignar servicio */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 block">Servicio</label>
                <select className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)]"
                  value={selServicioId ?? ''} onChange={e => setSelServicioId(Number(e.target.value) || null)}>
                  <option value="">Seleccionar servicio...</option>
                  {todosServicios.filter(s => s.activo !== false && !serviciosAsignados.some(a => a.servicioId === s.id)).map(s => (
                    <option key={s.id} value={s.id}>{s.nombre} (Bs. {s.monto})</option>
                  ))}
                </select>
              </div>
              <Button size="sm" onClick={assignServicio} disabled={!selServicioId}>
                <Check className="w-3.5 h-3.5" /> Asignar
              </Button>
            </div>
            {/* Lista de servicios asignados */}
            <div>
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Servicios asignados ({serviciosAsignados.length})</p>
              {serviciosAsignados.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)]">No tiene servicios asignados</p>
              ) : (
                <div className="space-y-1.5">
                  {serviciosAsignados.map(ms => (
                    <div key={ms.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{ms.servicio?.nombre ?? `Servicio #${ms.servicioId}`}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">Bs. {ms.servicio?.monto ?? '—'}</p>
                      </div>
                      <button onClick={() => removeServicio(ms.servicioId)} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--danger-500)] hover:bg-[var(--danger-50)]" title="Remover servicio">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
