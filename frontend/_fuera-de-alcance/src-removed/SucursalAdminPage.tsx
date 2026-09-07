import { useEffect, useState } from 'react';
import { Building2, Plus, Edit3, Users, UserRound, Calendar, BarChart3 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { sucursalAdminService } from '../api/services';
import type { PlanSuscripcion, Sucursal } from '../types';

interface SucursalConPlan extends Sucursal {
  planSuscripcion?: PlanSuscripcion;
  fechaActivacion?: string;
  fechaExpiracion?: string;
}

export default function SucursalAdminPage() {
  const [sucursales, setSucursales] = useState<SucursalConPlan[]>([]);
  const [planes, setPlanes] = useState<PlanSuscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SucursalConPlan | null>(null);
  const [statsModal, setStatsModal] = useState<{ sucursal: SucursalConPlan; stats: any } | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ nombre: '', direccion: '', telefono: '', email: '', planSuscripcionId: '' });

  const loadData = async () => {
    try {
      // Los "planes de suscripción" son una feature multi-tenant opcional; su ausencia
      // no debe impedir cargar las sucursales.
      const [sucRes, planRes] = await Promise.all([
        sucursalAdminService.getAll().catch(() => ({ data: [] })),
        sucursalAdminService.getPlanes().catch(() => ({ data: [] })),
      ]);
      setSucursales(sucRes.data);
      setPlanes(planRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(loadData, 0);
    return () => clearTimeout(t);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', direccion: '', telefono: '', email: '', planSuscripcionId: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (s: SucursalConPlan) => {
    setEditing(s);
    setForm({
      nombre: s.nombre,
      direccion: s.direccion || '',
      telefono: s.telefono || '',
      email: s.email || '',
      planSuscripcionId: s.planSuscripcionId?.toString() || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Formato de email inválido';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const payload: Omit<Sucursal, 'id'> = {
      nombre: form.nombre,
      direccion: form.direccion || undefined,
      telefono: form.telefono || undefined,
      email: form.email || undefined,
      planSuscripcionId: form.planSuscripcionId ? Number(form.planSuscripcionId) : undefined,
    };
    setSaveLoading(true);
    try {
      if (editing) {
        await sucursalAdminService.update(editing.id!, payload);
        toast('success', 'Sucursal actualizada', 'Los cambios se guardaron correctamente');
      } else {
        await sucursalAdminService.create(payload);
        toast('success', 'Sucursal creada', 'La sucursal fue registrada exitosamente');
      }
      setModalOpen(false);
      loadData();
    } catch (error) {
      toast('error', 'Error al guardar', 'No se pudo guardar la sucursal');
      console.error('Error saving sucursal:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const viewStats = async (s: SucursalConPlan) => {
    try {
      const res = await sucursalAdminService.getEstadisticas(s.id!);
      setStatsModal({ sucursal: s, stats: res.data });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="space-y-6 animate-in-up">
      <PageHeader
        icon={Building2}
        gradient="from-primary-500 to-primary-600"
        title="Administración de Sucursal"
        subtitle="Gestión de sucursales"
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Nueva Sucursal
          </Button>
        }
      />

      {loading ? (
        <div className="text-center py-12 text-[var(--text-tertiary)]">Cargando...</div>
      ) : (
        <div className="grid gap-6">
          {sucursales.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/20 dark:to-warning-500/20">
                    <Building2 className="w-6 h-6 text-[var(--warning-600)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{s.nombre}</h3>
                    <p className="text-sm text-[var(--text-tertiary)]">{s.direccion || 'Sin dirección'}</p>
                    {s.planSuscripcion && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-[var(--success-50)] text-[var(--success-700)] rounded-full">
                        {s.planSuscripcion.nombre}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => viewStats(s)}>
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Stats
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                    <Edit3 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {sucursales.length === 0 && (
            <div className="text-center py-12 text-[var(--text-tertiary)]">No hay sucursales registradas</div>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Sucursal' : 'Nueva Sucursal'} size="lg">
        {editing && <p className="text-sm text-[var(--text-secondary)] mb-4">Editando: {editing.nombre}</p>}
        <div className="space-y-4">
          <Input label="Nombre" required value={form.nombre} onChange={e => { setForm({ ...form, nombre: e.target.value }); setFormErrors(prev => { const n = { ...prev }; delete n.nombre; return n; }); }} error={formErrors.nombre} placeholder="Nombre de la sucursal" />
          <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección" />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Teléfono" />
          <Input label="Email" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setFormErrors(prev => { const n = { ...prev }; delete n.email; return n; }); }} error={formErrors.email} placeholder="Email" />
          <Select
            label="Plan de Suscripción"
            value={form.planSuscripcionId}
            onChange={(e) => setForm({ ...form, planSuscripcionId: e.target.value })}
            options={[
              { value: '', label: 'Sin plan' },
              ...(planes || []).map((p) => ({ value: p.id.toString(), label: `${p.nombre} - $${p.precioMensual}/mes` })),
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saveLoading}>Guardar</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!statsModal} onClose={() => setStatsModal(null)} title={`Estadísticas - ${statsModal?.sucursal.nombre || ''}`} size="lg">
        {statsModal?.stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-[var(--primary-50)] rounded-lg text-center">
                <Users className="w-6 h-6 text-[var(--primary-600)] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[var(--text-primary)]">{statsModal.stats.uso.pacientes.actual}</p>
                <p className="text-sm text-[var(--text-tertiary)]">Pacientes</p>
                <p className="text-xs text-[var(--text-tertiary)]">Máx: {statsModal.stats.uso.pacientes.maximo}</p>
              </div>
              <div className="p-4 bg-[var(--success-50)] rounded-lg text-center">
                <UserRound className="w-6 h-6 text-[var(--success-600)] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[var(--text-primary)]">{statsModal.stats.uso.medicos.actual}</p>
                <p className="text-sm text-[var(--text-tertiary)]">Médicos</p>
                <p className="text-xs text-[var(--text-tertiary)]">Máx: {statsModal.stats.uso.medicos.maximo}</p>
              </div>
              <div className="p-4 bg-[var(--fuchsia-50)] rounded-lg text-center">
                <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-[var(--text-primary)]">{statsModal.stats.uso.citasHoy}</p>
                <p className="text-sm text-[var(--text-tertiary)]">Citas Hoy</p>
              </div>
            </div>
            {statsModal.stats.plan && (
              <Card title="Plan Actual">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Plan:</span><span className="font-medium text-[var(--text-primary)]">{statsModal.stats.plan.nombre}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Precio:</span><span className="font-medium text-[var(--text-primary)]">${Number(statsModal.stats.plan.precioMensual).toFixed(2)}/mes</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Sucursales:</span><span className="font-medium text-[var(--text-primary)]">{statsModal.stats.plan.maxSucursales}</span></div>
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}
