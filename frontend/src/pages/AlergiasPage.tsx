import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Trash2, Search, User, Pencil } from 'lucide-react';
import { Button, Card, Modal, Input, Select, PageHeader, StatusBadge, severityToStatus, EmptyState } from '../components/ui';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { toast } from '../components/ui/Toast';
import { alergiaService, pacienteService } from '../api/services';
import { useForm } from 'react-hook-form';
import type { Alergia, Paciente, TipoAlergia } from '../types';
import api from '../api/axios';

export default function AlergiasPage() {
  const [alergias, setAlergias] = useState<Alergia[]>([]);
  const [tiposAlergia, setTiposAlergia] = useState<TipoAlergia[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [searchCatalog] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [patientAlergias, setPatientAlergias] = useState<any[]>([]);
  const [isCatalogModal, setIsCatalogModal] = useState(false);
  const [editingAlergia, setEditingAlergia] = useState<Alergia | null>(null);
  const [isAssignModal, setIsAssignModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'catalog' | 'patient'; id: number; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { register: registerCatalog, handleSubmit: handleSubmitCatalog, reset: resetCatalog, formState: { errors: errorsCatalog } } = useForm();
  const { register: registerAssign, handleSubmit: handleSubmitAssign, formState: { errors: errorsAssign } } = useForm();

const ALERGIA_VALIDACIONES = {
  nombre: { required: 'El nombre es requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } },
  severidad: { required: 'La severidad es requerida' },
  alergiaId: { required: 'Seleccione una alergia' },
};

  const fetchAlergias = async () => { try { const res = await alergiaService.getAll(); setAlergias(res.data ?? []); } catch { /* sin datos */ } };
  const fetchTiposAlergia = async () => { try { const res = await api.get<TipoAlergia[]>('/tipos-alergia'); setTiposAlergia(res.data ?? []); } catch { /* sin datos */ } };
  const fetchPacientes = async () => { try { const res = await pacienteService.getAll(); setPacientes(res.data ?? []); } catch { /* sin datos */ } };
  const fetchPatientAlergias = async (pacienteId: number) => { try { const res = await alergiaService.getByPaciente(pacienteId); setPatientAlergias(res.data ?? []); } catch { /* sin datos */ } };

  useEffect(() => {
    const t = setTimeout(() => { fetchAlergias(); fetchTiposAlergia(); fetchPacientes(); }, 0);
    return () => clearTimeout(t);
  }, []);

  const filteredAlergias = (alergias || []).filter(a => a.nombre.toLowerCase().includes(searchCatalog.toLowerCase()));
  const filteredPacientes = (pacientes || []).filter(p => `${p.nombre} ${p.apellido} ${p.ci}`.toLowerCase().includes(searchPatient.toLowerCase()));

  const handleOpenCatalogModal = (alergia?: Alergia) => {
    setEditingAlergia(alergia || null);
    resetCatalog(alergia ? { nombre: alergia.nombre, descripcion: alergia.descripcion || '', severidad: alergia.severidad, tipoAlergiaId: alergia.tipoAlergiaId || '' }
      : { nombre: '', descripcion: '', severidad: 'leve', tipoAlergiaId: '' });
    setIsCatalogModal(true);
  };

  const onSubmitCatalog = async (data: any) => {
    setFormLoading(true);
    try {
      if (editingAlergia?.id) { await api.put(`/alergias/${editingAlergia.id}`, data); toast('success', 'Alergia actualizada'); }
      else { await alergiaService.create(data); toast('success', 'Alergia creada'); }
      setIsCatalogModal(false); fetchAlergias();
    } catch { toast('error', 'Error al guardar'); } finally { setFormLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      if (confirmDelete.type === 'catalog') { await api.delete(`/alergias/${confirmDelete.id}`); toast('success', 'Alergia eliminada'); fetchAlergias(); }
      else if (selectedPatient?.id) { await alergiaService.removeFromPaciente(selectedPatient.id, confirmDelete.id); toast('success', 'Alergia eliminada del paciente'); fetchPatientAlergias(selectedPatient.id); }
      setConfirmDelete(null);
    } catch { toast('error', 'Error'); } finally { setDeleteLoading(false); }
  };

  const handleSelectPatient = (paciente: Paciente) => {
    setSelectedPatient(paciente); setSearchPatient('');
    if (paciente.id) fetchPatientAlergias(paciente.id);
  };

  const handleAssignAlergia = async (data: any) => {
    if (!selectedPatient?.id) return;
    setFormLoading(true);
    try {
      await alergiaService.asignarAPaciente(selectedPatient.id, { alergiaId: Number(data.alergiaId), severidad: data.severidad });
      toast('success', 'Alergia asignada'); setIsAssignModal(false);
      if (selectedPatient.id) fetchPatientAlergias(selectedPatient.id);
    } catch { toast('error', 'Error'); } finally { setFormLoading(false); }
  };

  const catalogColumns: Column<Alergia>[] = [
    { key: 'nombre', header: 'Nombre', sortable: true, render: (a) => (<span className="font-medium text-[var(--text-primary)]">{a.nombre}</span>) },
    { key: 'severidad', header: 'Severidad', render: (a) => (<StatusBadge variant={severityToStatus(a.severidad)} dot>{a.severidad}</StatusBadge>) },
    { key: 'tipoAlergia', header: 'Tipo', render: (a) => (<span className="text-[var(--text-secondary)]">{a.tipoAlergia?.nombre || '-'}</span>) },
    { key: 'acciones', header: 'Acciones', align: 'right', render: (a) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="sm" icon onClick={() => handleOpenCatalogModal(a)}><Pencil className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="sm" icon onClick={() => setConfirmDelete({ type: 'catalog', id: a.id!, name: a.nombre })}>
          <Trash2 className="w-3.5 h-3.5 text-[var(--danger-500)]" />
        </Button>
      </div>
    )},
  ];

  const patientColumns: Column<any>[] = [
    { key: 'nombre', header: 'Alergia', sortable: true, render: (pa) => (<span className="font-medium text-[var(--text-primary)]">{pa.nombre}</span>) },
    { key: 'severidad', header: 'Severidad', render: (pa) => (<StatusBadge variant={severityToStatus(pa.severidad)} dot>{pa.severidad}</StatusBadge>) },
    { key: 'descripcion', header: 'Descripción', render: (pa) => (<span className="text-[var(--text-secondary)]">{pa.descripcion || '-'}</span>) },
    { key: 'acciones', header: 'Acciones', align: 'right', render: (pa) => (
      <Button variant="ghost" size="sm" icon onClick={() => setConfirmDelete({ type: 'patient', id: pa.id, name: pa.nombre })}>
        <Trash2 className="w-3.5 h-3.5 text-[var(--danger-500)]" />
      </Button>
    )},
  ];

  return (
    <div className="space-y-6 animate-in-up">
      <PageHeader icon={AlertTriangle} gradient="from-warning-500 to-danger-500"
        title="Alergias" subtitle="Gestión del catálogo de alergias" />

      <Card title="Catálogo de Alergias" subtitle={`${alergias.length} alergias registradas`}
        accent="primary"
        className="animate-in-up"
        action={<Button variant="premium" onClick={() => handleOpenCatalogModal()}><Plus className="w-4 h-4" />Nueva Alergia</Button>}>
        <div className="table-premium">
          <DataTable columns={catalogColumns} data={filteredAlergias} searchable={false}
            keyExtractor={(a) => a.id!} pageSize={50} />
        </div>
      </Card>

      <Card title="Alergias del Paciente" subtitle="Asignar y gestionar alergias por paciente"
        accent="fuchsia"
        className="animate-in-up">
        <div className="mb-4 relative">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input type="text" placeholder="Buscar paciente por nombre o CI..." value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] focus:border-[var(--primary-500)]" />
          </div>
          {searchPatient && (
            <div className="absolute z-10 mt-1 w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg shadow-dropdown max-h-60 overflow-y-auto">
              {filteredPacientes.map((p) => (
                <button key={p.id} className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] flex items-center gap-2 transition-colors"
                  onClick={() => handleSelectPatient(p)}>
                  <User className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="font-medium text-[var(--text-primary)]">{p.nombre} {p.apellido}</span>
                  <span className="text-[var(--text-tertiary)]">- {p.ci}</span>
                </button>
              ))}
              {filteredPacientes.length === 0 && <p className="px-4 py-2 text-sm text-[var(--text-tertiary)]">No se encontraron pacientes</p>}
            </div>
          )}
        </div>

        {selectedPatient ? (
          <>
            <div className="flex items-center justify-between mb-4 p-4 bg-[var(--primary-50)] dark:bg-[var(--primary-500/10)]/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-600)] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{selectedPatient.nombre} {selectedPatient.apellido}</p>
                  <p className="text-sm text-[var(--text-tertiary)]">{selectedPatient.ci}</p>
                </div>
              </div>
              <Button variant="premium" size="sm" onClick={() => setIsAssignModal(true)}><Plus className="w-4 h-4 mr-1" />Asignar Alergia</Button>
            </div>
            <div className="table-premium">
              <DataTable columns={patientColumns} data={patientAlergias} searchable={false}
                keyExtractor={(pa) => pa.id} pageSize={50}
                emptyMessage="Este paciente no tiene alergias registradas." />
            </div>
          </>
        ) : (
          <EmptyState icon={User} title="Seleccione un paciente"
            description="Busque un paciente arriba para gestionar sus alergias" />
        )}
      </Card>

      <Modal isOpen={isCatalogModal} onClose={() => setIsCatalogModal(false)}
        title={editingAlergia ? 'Editar Alergia' : 'Nueva Alergia'} accent="primary">
        <form onSubmit={handleSubmitCatalog(onSubmitCatalog)} className="space-y-4">
          {editingAlergia?.nombre ? <p className="text-sm text-[var(--text-secondary)]">Editando: {editingAlergia.nombre}</p> : null}
          <Input label="Nombre" placeholder="Nombre de la alergia" required error={errorsCatalog.nombre?.message as string} {...registerCatalog('nombre', ALERGIA_VALIDACIONES.nombre)} />
          <Input label="Descripción" placeholder="Descripción" {...registerCatalog('descripcion')} />
          <Select label="Severidad" required options={[{ value: 'leve', label: 'Leve' }, { value: 'moderada', label: 'Moderada' }, { value: 'severa', label: 'Severa' }, { value: 'anafilactica', label: 'Anafiláctica' }]} error={errorsCatalog.severidad?.message as string} {...registerCatalog('severidad', ALERGIA_VALIDACIONES.severidad)} />
          <Select label="Tipo de Alergia" options={[{ value: '', label: 'Seleccionar...' }, ...(tiposAlergia || []).map(t => ({ value: t.id, label: t.nombre }))]} {...registerCatalog('tipoAlergiaId')} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsCatalogModal(false)}>Cancelar</Button>
            <Button type="submit" loading={formLoading}>{editingAlergia ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAssignModal} onClose={() => setIsAssignModal(false)} title="Asignar Alergia a Paciente" accent="fuchsia">
        <form onSubmit={handleSubmitAssign(handleAssignAlergia)} className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">Asignando a: {selectedPatient?.nombre || ''} {selectedPatient?.apellido || ''}</p>
          <Select label="Alergia" required options={[{ value: '', label: 'Seleccionar alergia...' }, ...(alergias || []).map(a => ({ value: a.id, label: a.nombre }))]} error={errorsAssign.alergiaId?.message as string} {...registerAssign('alergiaId', ALERGIA_VALIDACIONES.alergiaId)} />
          <Select label="Severidad" options={[{ value: '', label: 'Usar severidad por defecto' }, { value: 'leve', label: 'Leve' }, { value: 'moderada', label: 'Moderada' }, { value: 'severa', label: 'Severa' }, { value: 'anafilactica', label: 'Anafiláctica' }]} {...registerAssign('severidad')} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAssignModal(false)}>Cancelar</Button>
            <Button type="submit" loading={formLoading}>Asignar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDeleteConfirm}
        title={confirmDelete?.type === 'catalog' ? 'Eliminar Alergia' : 'Eliminar Alergia del Paciente'}
        message={confirmDelete?.type === 'catalog' ? `¿Está seguro de eliminar ${confirmDelete?.name}?` : '¿Está seguro de eliminar esta alergia del paciente?'}
        confirmText="Eliminar" variant="danger" loading={deleteLoading} />
    </div>
  );
}
