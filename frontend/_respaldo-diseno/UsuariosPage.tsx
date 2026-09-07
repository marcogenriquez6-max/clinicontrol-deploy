import { useEffect, useState } from 'react';
import { Users, Shield, UserCog, Stethoscope, HeartPulse, UserRound, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Modal, Input, Select } from '../components/ui';
import { usuarioService, rolService } from '../api/services';
import type { Usuario, Rol } from '../types';
import Swal from 'sweetalert2';

const ROLE_ICONS: Record<string, any> = {
  ADMIN: Shield,
  DOCTOR: Stethoscope,
  RECEPCION: UserRound,
  admin: Shield,
  medico: Stethoscope,
  enfermeria: HeartPulse,
  recepcionista: UserRound,
  paciente: UserCog,
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'from-slate-700 to-slate-800',
  gerente: 'from-slate-600 to-slate-700',
  medico: 'from-cyan-700 to-cyan-800',
  enfermeria: 'from-teal-600 to-teal-700',
  recepcionista: 'from-sky-700 to-sky-800',
  secretaria: 'from-sky-800 to-slate-800',
};

const ROLE_ACCENTS: Record<string, string> = {
  ADMIN: 'danger',
  DOCTOR: 'primary',
  RECEPCION: 'accent',
  admin: 'danger',
  medico: 'primary',
  enfermeria: 'success',
  recepcionista: 'accent',
  paciente: 'warning',
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  ADMIN: 'bg-[var(--danger-100)] text-[var(--danger-700)]',
  DOCTOR: 'bg-[var(--info-100)] text-[var(--info-700)]',
  RECEPCION: 'bg-[var(--primary-100)] text-[var(--primary-700)]',
  admin: 'bg-[var(--danger-100)] text-[var(--danger-700)]',
  medico: 'bg-[var(--info-100)] text-[var(--info-700)]',
  enfermeria: 'bg-[var(--success-100)] text-[var(--success-700)]',
  recepcionista: 'bg-[var(--primary-100)] text-[var(--primary-700)]',
  paciente: 'bg-[var(--warning-100)] text-[var(--warning-700)]',
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', password: '', ci: '', rolId: 1 });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      usuarioService.getAll(),
      rolService.getAll(),
    ]).then(([usersRes, rolesRes]) => {
      setUsuarios(usersRes.data || []);
      setRoles(rolesRes.data || []);
    }).catch(() => { Swal.fire({ icon: 'error', title: 'Error al cargar datos' }); }).finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(loadData, 0);
    return () => clearTimeout(t);
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setFormData({ nombre: '', apellido: '', email: '', password: '', ci: '', rolId: roles[0]?.id || 1 });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido || '',
      email: user.email,
      password: '',
      ci: user.ci || '',
      rolId: user.rolId,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!formData.nombre.trim()) errs.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) errs.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) errs.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Formato de email inválido';
    if (!editingUser) {
      if (formData.password.length < 8) errs.password = 'Mínimo 8 caracteres';
      else if (!/[A-Z]/.test(formData.password)) errs.password = 'Debe contener mayúscula';
      else if (!/[a-z]/.test(formData.password)) errs.password = 'Debe contener minúscula';
      else if (!/\d/.test(formData.password)) errs.password = 'Debe contener número';
      else if (!/[!@#$%^&*(),.?":{}|<>_-]/.test(formData.password)) errs.password = 'Debe contener carácter especial';
    }
    if (formData.ci && !/^\d{5,15}$/.test(formData.ci)) errs.ci = 'CI inválida (5-15 dígitos)';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      const payload: any = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        ci: formData.ci || undefined,
        rolId: formData.rolId,
      };
      if (formData.password) payload.password = formData.password;

      if (editingUser) {
        await usuarioService.update(editingUser.id!, payload);
        Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1500, showConfirmButton: false });
      } else {
        await usuarioService.create(payload);
        Swal.fire({ icon: 'success', title: 'Creado', timer: 1500, showConfirmButton: false });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: Usuario) => {
    const result = await Swal.fire({
      icon: 'question', title: '¿Eliminar usuario?',
      text: `${user.nombre} ${user.apellido || ''} (${user.email})`,
      showCancelButton: true, confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      await usuarioService.delete(user.id!);
      Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
      loadData();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al eliminar' });
    }
  };

  const usuariosPorRol = roles.map(rol => ({
    rol,
    usuarios: usuarios.filter(u => u.rolId === rol.id),
    icon: ROLE_ICONS[rol.nombre.toUpperCase()] || ROLE_ICONS[rol.nombre] || Users,
    color: ROLE_COLORS[rol.nombre.toUpperCase()] || ROLE_COLORS[rol.nombre] || 'from-gray-500 to-gray-600',
    badgeColor: ROLE_BADGE_COLORS[rol.nombre.toUpperCase()] || ROLE_BADGE_COLORS[rol.nombre] || 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
    accent: ROLE_ACCENTS[rol.nombre.toUpperCase()] || ROLE_ACCENTS[rol.nombre] || 'primary',
  }));

  const totalUsuarios = usuarios.length;

  return (
    <div className="space-y-6 animate-in-up">
      <PageHeader
        icon={Users}
        gradient="from-primary-500 to-purple-600"
        title="Usuarios del Sistema"
        subtitle="Gestión de usuarios y roles"
        stats={[
          { label: 'total usuarios', value: totalUsuarios },
          { label: 'roles', value: roles.length },
        ]}
        action={
          <Button variant="premium" size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-in-up rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] p-5" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="animate-pulse space-y-4">
                <div className="h-6 shimmer rounded w-1/3" />
                <div className="h-4 shimmer rounded w-2/3" />
                <div className="space-y-2">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-12 shimmer rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {usuariosPorRol.map(({ rol, usuarios: users, icon: Icon, color, accent }, idx) => (
            <div key={rol.id} className={`animate-in-up rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] p-5 ${accent === 'primary' ? 'border-l-4 border-l-[var(--primary-500)]' : accent === 'danger' ? 'border-l-4 border-l-danger-500' : accent === 'warning' ? 'border-l-4 border-l-amber-500' : ''}`} style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${color} shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)] capitalize">{rol.nombre}</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">{users.length} usuario(s)</p>
                  </div>
                </div>

                {users.length === 0 ? (
                  <div className="py-6 text-center text-sm text-[var(--text-tertiary)]">
                    No hay usuarios con este rol
                  </div>
                ) : (
                  <div className="space-y-2">
                    {users.map((user, uIdx) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--primary-200)] hover:bg-[var(--primary-50)] dark:hover:bg-[rgba(99,102,241,0.04)] transition-all group animate-in-up"
                        style={{ animationDelay: `${uIdx * 50}ms` }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[var(--primary-600)] flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                            {user.nombre.charAt(0)}{user.apellido?.charAt(0) || ''}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {user.nombre} {user.apellido || ''}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)] truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {user.ci && (
                            <span className="text-[10px] text-[var(--text-tertiary)] hidden sm:block mr-1">
                              CI: {user.ci}
                            </span>
                          )}
                          <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--primary-600)] hover:bg-[var(--primary-50)] transition-all opacity-0 group-hover:opacity-100">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(user)} className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--danger-600)] hover:bg-[var(--danger-50)] transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="animate-in-up rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] p-5 border-l-4 border-l-[var(--primary-500)]" style={{ animationDelay: '400ms' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--primary-500)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {totalUsuarios} usuario(s) en {roles.length} rol(es)
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-[var(--text-tertiary)]">
            {roles.map(rol => (
              <span key={rol.id} className="capitalize">
                {rol.nombre}: {usuarios.filter(u => u.rolId === rol.id).length}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'} size="lg" accent="primary">
        {editingUser && <p className="text-sm text-[var(--text-secondary)] mb-4">Editando: {editingUser.nombre} {editingUser.apellido || ''}</p>}
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre" required value={formData.nombre} onChange={e => { setFormData(p => ({ ...p, nombre: e.target.value })); setFormErrors(prev => { const n = { ...prev }; delete n.nombre; return n; }); }} error={formErrors.nombre} placeholder="Ej: Juan" />
            <Input label="Apellido" required value={formData.apellido} onChange={e => { setFormData(p => ({ ...p, apellido: e.target.value })); setFormErrors(prev => { const n = { ...prev }; delete n.apellido; return n; }); }} error={formErrors.apellido} placeholder="Ej: Pérez" />
          </div>
          <Input label="Email" required type="email" value={formData.email} onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); setFormErrors(prev => { const n = { ...prev }; delete n.email; return n; }); }} error={formErrors.email} placeholder="ejemplo@clinica.com" />
          <Input label={editingUser ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'} required={!editingUser} type="password" value={formData.password} onChange={e => { setFormData(p => ({ ...p, password: e.target.value })); setFormErrors(prev => { const n = { ...prev }; delete n.password; return n; }); }} error={formErrors.password} placeholder="Mínimo 6 caracteres" />
          <Input label="CI" value={formData.ci} onChange={e => { setFormData(p => ({ ...p, ci: e.target.value })); setFormErrors(prev => { const n = { ...prev }; delete n.ci; return n; }); }} error={formErrors.ci} placeholder="Cédula de identidad (5-15 dígitos)" />
          <Select label="Rol" value={formData.rolId} onChange={e => setFormData(p => ({ ...p, rolId: Number(e.target.value) }))} options={roles.map(r => ({ value: r.id, label: r.nombre }))} />
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-primary)]">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="premium" onClick={handleSave} loading={saving}>{editingUser ? 'Actualizar' : 'Crear Usuario'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
