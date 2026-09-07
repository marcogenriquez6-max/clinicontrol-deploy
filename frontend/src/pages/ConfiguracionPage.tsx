import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Building2, Stethoscope, BedDouble, Banknote, Save, Plus, Pencil } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card, Input, Modal, Select } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { errMsg } from '../api/errMsg';
import { configuracionService } from '../api/configuracion.service';
import { tipoAtencionService } from '../api/tipoAtencion.service';
import api from '../api/axios';
import type { ClinicaInfo, TipoAtencion } from '../types';
import { lista, objeto } from '../utils/api.utils';
import { invalidarClinica, fmtBs } from '../utils/impresion';

interface Cama { id: number; codigoCama: string; servicio: string; piso?: string; habitacion?: string; estado: string; activo?: boolean }
type Tab = 'clinica' | 'medicos' | 'camas' | 'tarifas';
const CAMA_LABEL: Record<string, string> = { disponible: 'Disponible', ocupado: 'Ocupada', reservado: 'Reservada', limpieza: 'En limpieza', mantenimiento: 'Mantenimiento' };

/** Administración → Configuración: datos de la clínica y catálogos (médicos, camas, tarifas). */
export default function ConfiguracionPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('clinica');
  const [clinica, setClinica] = useState<ClinicaInfo>({ nombre: '', direccion: '', telefono: '', email: '', nit: '' });
  const [guardando, setGuardando] = useState(false);
  const [camas, setCamas] = useState<Cama[]>([]);
  const [camaModal, setCamaModal] = useState<Partial<Cama> | null>(null);
  const [tarifas, setTarifas] = useState<TipoAtencion[]>([]);
  const [tarifaModal, setTarifaModal] = useState<Partial<TipoAtencion> | null>(null);

  const loadClinica = () => configuracionService.getClinica().then((r) => setClinica(objeto<ClinicaInfo>(r))).catch(() => {});
  const loadCamas = () => api.get('/camas').then((r) => setCamas(lista<Cama>(r))).catch(() => setCamas([]));
  const loadTarifas = () => tipoAtencionService.getAll().then((r) => setTarifas(lista<TipoAtencion>(r))).catch(() => setTarifas([]));

  useEffect(() => { const t = setTimeout(() => { loadClinica(); loadCamas(); loadTarifas(); }, 0); return () => clearTimeout(t); }, []);

  const guardarClinica = async () => {
    if (clinica.nombre.trim().length < 3) { toast('warning', 'El nombre de la clínica es obligatorio'); return; }
    setGuardando(true);
    try { setClinica(objeto<ClinicaInfo>(await configuracionService.updateClinica(clinica))); invalidarClinica(); toast('success', 'Configuración guardada', 'Los recibos y reportes usarán estos datos'); }
    catch (e) { toast('error', 'No se pudo guardar', errMsg(e)); } finally { setGuardando(false); }
  };

  const guardarCama = async () => {
    if (!camaModal?.codigoCama?.trim() || !camaModal?.servicio?.trim()) { toast('warning', 'Código y servicio son obligatorios'); return; }
    setGuardando(true);
    try {
      const body = { codigoCama: camaModal.codigoCama.trim(), servicio: camaModal.servicio.trim(), piso: camaModal.piso || undefined, habitacion: camaModal.habitacion || undefined, estado: camaModal.estado || 'disponible' };
      if (camaModal.id) await api.put(`/camas/${camaModal.id}`, body); else await api.post('/camas', body);
      toast('success', camaModal.id ? 'Cama actualizada' : 'Cama registrada'); setCamaModal(null); loadCamas();
    } catch (e) { toast('error', 'No se pudo guardar la cama', errMsg(e)); } finally { setGuardando(false); }
  };

  const guardarTarifa = async () => {
    if (!tarifaModal?.nombre?.trim() || tarifaModal.monto == null || Number(tarifaModal.monto) < 0) { toast('warning', 'Nombre y monto son obligatorios'); return; }
    setGuardando(true);
    try {
      if (tarifaModal.id) await tipoAtencionService.update(tarifaModal.id, { nombre: tarifaModal.nombre.trim(), monto: Number(tarifaModal.monto), duracionMinutos: tarifaModal.duracionMinutos ? Number(tarifaModal.duracionMinutos) : undefined, activo: tarifaModal.activo ?? true });
      else await tipoAtencionService.create({ nombre: tarifaModal.nombre.trim(), monto: Number(tarifaModal.monto) });
      toast('success', 'Tarifa guardada'); setTarifaModal(null); loadTarifas();
    } catch (e) { toast('error', 'No se pudo guardar la tarifa', errMsg(e)); } finally { setGuardando(false); }
  };

  const TABS: { id: Tab; label: string; icon: typeof Settings }[] = [
    { id: 'clinica', label: 'Datos de la clínica', icon: Building2 }, { id: 'medicos', label: 'Médicos', icon: Stethoscope }, { id: 'camas', label: 'Camas', icon: BedDouble }, { id: 'tarifas', label: 'Servicios y tarifas', icon: Banknote },
  ];

  return (
    <div className="space-y-6">
      <PageHeader icon={Settings} title="Configuración" subtitle="Datos institucionales y catálogos que usa el sistema" />
      <div className="flex gap-1 p-1 bg-[var(--bg-tertiary)] rounded-xl overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap ${tab === t.id ? 'bg-[var(--bg-primary)] text-[var(--primary-600)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}><t.icon className="w-4 h-4" />{t.label}</button>
        ))}
      </div>

      {tab === 'clinica' && (
        <Card title="Clínica Santa Isabel" subtitle="Estos datos aparecen en recibos, recetas y reportes impresos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre *" value={clinica.nombre} onChange={(e) => setClinica({ ...clinica, nombre: e.target.value })} />
            <Input label="NIT" value={clinica.nit} onChange={(e) => setClinica({ ...clinica, nit: e.target.value })} />
            <div className="md:col-span-2"><Input label="Dirección" value={clinica.direccion} onChange={(e) => setClinica({ ...clinica, direccion: e.target.value })} /></div>
            <Input label="Teléfono" value={clinica.telefono} onChange={(e) => setClinica({ ...clinica, telefono: e.target.value })} />
            <Input label="Correo" type="email" value={clinica.email ?? ''} onChange={(e) => setClinica({ ...clinica, email: e.target.value })} />
          </div>
          <div className="flex justify-end pt-4"><Button onClick={guardarClinica} loading={guardando}><Save className="w-4 h-4" />Guardar</Button></div>
        </Card>
      )}

      {tab === 'medicos' && (
        <Card title="Médicos" subtitle="Alta de médicos, especialidad, consultorio y vínculo con su usuario de acceso">
          <p className="text-sm text-[var(--text-secondary)] mb-4">Cada médico debe estar vinculado a un usuario con rol Médico para ver su Agenda del Día y firmar consultas.</p>
          <Button onClick={() => navigate('/medicos')}><Stethoscope className="w-4 h-4" />Administrar médicos</Button>
        </Card>
      )}

      {tab === 'camas' && (
        <Card title="Camas" subtitle="Control de camas para hospitalización" action={<Button size="sm" onClick={() => setCamaModal({ estado: 'disponible' })}><Plus className="w-4 h-4" />Nueva cama</Button>} className="overflow-hidden">
          <table className="table-premium w-full text-sm">
            <thead><tr><th>Código</th><th>Servicio</th><th>Piso</th><th>Habitación</th><th>Estado</th><th className="text-right">Editar</th></tr></thead>
            <tbody>
              {camas.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-[var(--text-tertiary)]">Sin camas registradas</td></tr>}
              {camas.map((c) => <tr key={c.id}><td className="font-semibold">{c.codigoCama}</td><td>{c.servicio}</td><td>{c.piso || '—'}</td><td>{c.habitacion || '—'}</td><td>{CAMA_LABEL[c.estado] ?? c.estado}</td><td className="text-right"><Button size="sm" variant="ghost" onClick={() => setCamaModal(c)}><Pencil className="w-4 h-4" /></Button></td></tr>)}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'tarifas' && (
        <Card title="Servicios y tarifas" subtitle="Tipos de atención y su monto en bolivianos" action={<Button size="sm" onClick={() => setTarifaModal({ monto: 0 })}><Plus className="w-4 h-4" />Nuevo servicio</Button>} className="overflow-hidden">
          <table className="table-premium w-full text-sm">
            <thead><tr><th>Servicio</th><th className="text-right">Monto</th><th className="text-right">Duración</th><th>Estado</th><th className="text-right">Editar</th></tr></thead>
            <tbody>
              {tarifas.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-[var(--text-tertiary)]">Sin servicios registrados</td></tr>}
              {tarifas.map((t) => <tr key={t.id}><td className="font-medium">{t.nombre}</td><td className="text-right tabular-nums">{fmtBs(t.monto)}</td><td className="text-right">{t.duracionMinutos ?? 30} min</td><td>{t.activo === false ? 'Inactivo' : 'Activo'}</td><td className="text-right"><Button size="sm" variant="ghost" onClick={() => setTarifaModal(t)}><Pencil className="w-4 h-4" /></Button></td></tr>)}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={!!camaModal} onClose={() => setCamaModal(null)} title={camaModal?.id ? 'Editar cama' : 'Nueva cama'} size="md">
        {camaModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Código *" placeholder="101" value={camaModal.codigoCama ?? ''} onChange={(e) => setCamaModal({ ...camaModal, codigoCama: e.target.value })} />
              <Input label="Servicio *" placeholder="Medicina Interna" value={camaModal.servicio ?? ''} onChange={(e) => setCamaModal({ ...camaModal, servicio: e.target.value })} />
              <Input label="Piso" value={camaModal.piso ?? ''} onChange={(e) => setCamaModal({ ...camaModal, piso: e.target.value })} />
              <Input label="Habitación" value={camaModal.habitacion ?? ''} onChange={(e) => setCamaModal({ ...camaModal, habitacion: e.target.value })} />
              <Select label="Estado" value={camaModal.estado ?? 'disponible'} onChange={(e) => setCamaModal({ ...camaModal, estado: e.target.value })} options={Object.entries(CAMA_LABEL).map(([value, label]) => ({ value, label }))} />
            </div>
            <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setCamaModal(null)}>Cancelar</Button><Button onClick={guardarCama} loading={guardando}><Save className="w-4 h-4" />Guardar</Button></div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!tarifaModal} onClose={() => setTarifaModal(null)} title={tarifaModal?.id ? 'Editar servicio' : 'Nuevo servicio'} size="md">
        {tarifaModal && (
          <div className="space-y-4">
            <Input label="Nombre *" placeholder="Consulta Médica" value={tarifaModal.nombre ?? ''} onChange={(e) => setTarifaModal({ ...tarifaModal, nombre: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Monto (Bs) *" type="number" step="0.01" value={String(tarifaModal.monto ?? '')} onChange={(e) => setTarifaModal({ ...tarifaModal, monto: Number(e.target.value) })} />
              <Input label="Duración (min)" type="number" value={String(tarifaModal.duracionMinutos ?? 30)} onChange={(e) => setTarifaModal({ ...tarifaModal, duracionMinutos: Number(e.target.value) })} />
            </div>
            <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setTarifaModal(null)}>Cancelar</Button><Button onClick={guardarTarifa} loading={guardando}><Save className="w-4 h-4" />Guardar</Button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
