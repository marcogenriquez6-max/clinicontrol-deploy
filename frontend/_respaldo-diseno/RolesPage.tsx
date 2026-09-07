import { useState, useEffect } from 'react';
import { Shield, Plus, Pencil, Check } from 'lucide-react';
import { PageHeader, Card, Button, Modal, Input, Badge } from '../components/ui';
import { rolService } from '../api/services';
import api from '../api/axios';
import { ROLES_MATRIZ, type RolInfo } from '../data/rbac';
import type { Rol } from '../types';
import Swal from 'sweetalert2';

const ROLE_COLORS: Record<string, string> = {
  admin: 'from-slate-700 to-slate-800',
  gerente: 'from-slate-600 to-slate-700',
  medico: 'from-cyan-700 to-cyan-800',
  enfermeria: 'from-teal-600 to-teal-700',
  recepcionista: 'from-sky-700 to-sky-800',
  secretaria: 'from-primary-500 to-primary-600',
};

function RolCard({ info }: { info: RolInfo }) {
  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: info.color }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[var(--text-primary)] truncate">{info.nombre}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {info.hu.map(h => (
                <span key={h} className="px-1.5 py-0.5 text-[10px] font-medium rounded border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)]">{h}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">{info.descripcion}</p>

      <ul className="mt-4 space-y-2 flex-1">
        {info.capacidades.map(cap => (
          <li key={cap} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
            <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: info.color }} />
            <span>{cap}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-3 border-t border-[var(--border-primary)]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Módulos visibles</p>
        <div className="flex flex-wrap gap-1.5">
          {info.modulos.map(m => (
            <span key={m} className="px-2 py-0.5 text-xs rounded-full bg-[var(--primary-50)] text-[var(--primary-700)]">{m}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await rolService.getAll();
      setRoles(res.data || []);
    } catch { /* catálogo no disponible: se muestra la matriz estática */ } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(loadRoles, 0);
    return () => clearTimeout(t);
  }, []);

  const openCreate = () => {
    setEditingRol(null);
    setFormData({ nombre: '', descripcion: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (rol: Rol) => {
    setEditingRol(rol);
    setFormData({ nombre: rol.nombre, descripcion: rol.descripcion || '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!formData.nombre.trim()) errs.nombre = 'El nombre del rol es requerido';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      if (editingRol) {
        await api.put(`/roles/${editingRol.id}`, formData);
      } else {
        await api.post('/roles', formData);
      }
      Swal.fire({ icon: 'success', title: editingRol ? 'Actualizado' : 'Creado', timer: 1500, showConfirmButton: false });
      setModalOpen(false);
      loadRoles();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al guardar';
      Swal.fire({ icon: 'error', title: 'Error', text: message });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-in-up">
      <PageHeader
        icon={Shield}
        title="Roles y Permisos"
        subtitle="Control de acceso basado en roles — seis perfiles operativos"
        stats={[{ label: 'perfiles', value: Object.keys(ROLES_MATRIZ).length }]}
        action={
          <Button variant="secondary" size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Nuevo Rol
          </Button>
        }
      />

      {/* Matriz RBAC: qué hace cada rol */}
      <section aria-label="Matriz de roles">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Object.values(ROLES_MATRIZ).map(info => <RolCard key={info.key} info={info} />)}
        </div>
      </section>

      {/* Catálogo persistido en base de datos */}
      <section aria-label="Catálogo de roles" className="pt-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">Catálogo en base de datos</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i}><div className="animate-pulse h-24 bg-[var(--bg-tertiary)] rounded-lg" /></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(rol => {
              const gradient = ROLE_COLORS[rol.nombre] || 'from-gray-500 to-gray-600';
              return (
                <Card key={rol.id}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <Badge variant="neutral">#{rol.id}</Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] capitalize">{rol.nombre}</h3>
                      {rol.descripcion && (
                        <p className="text-sm text-[var(--text-tertiary)] mt-1">{rol.descripcion}</p>
                      )}
                    </div>
                    <button onClick={() => openEdit(rol)} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary-700)] hover:bg-[var(--primary-50)] px-2 py-1 rounded-md transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Editar descripción
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingRol ? 'Editar Rol' : 'Nuevo Rol'}>
        {editingRol && <p className="text-sm text-[var(--text-secondary)] mb-4">Editando: {editingRol.nombre}</p>}
        <div className="space-y-5">
          <Input label="Nombre del rol" required value={formData.nombre} onChange={e => { setFormData(p => ({ ...p, nombre: e.target.value })); setFormErrors(prev => { const n = { ...prev }; delete n.nombre; return n; }); }} error={formErrors.nombre} placeholder="Ej: ADMIN" />
          <Input label="Descripción" value={formData.descripcion} onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción del rol" />
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-primary)]">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>{editingRol ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
