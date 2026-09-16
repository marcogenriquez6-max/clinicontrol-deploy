import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, BedDouble, LogOut, FileText, NotebookPen, ClipboardList, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button, Modal, Input, Select, Textarea, FormSection, Card, Badge, DataTable, type Column } from '../components/ui';
import PageHeader from '../components/ui/PageHeader';
import { toast } from '../components/ui/Toast';
import { useStore } from '../store';
import { errMsg } from '../api/errMsg';
import { hospitalizacionService, camaService, type Hospitalizacion, type Cama, type HospStats } from '../api/hospitalizacion.service';
import { reportesService } from '../api/reportes.service';
import ReportePanel, { type ReporteDefinicion } from '../components/reportes/ReportePanel';
import { lista, objeto, hoyIso } from '../utils/api.utils';
import { fmtFecha, type SeccionReporte } from '../utils/impresion';

type Seccion = 'camas' | 'internaciones' | 'evoluciones' | 'altas' | 'reportes';
const SECCIONES: { id: Seccion; label: string; icon: typeof BedDouble }[] = [
  { id: 'camas', label: 'Camas', icon: BedDouble },
  { id: 'internaciones', label: 'Internaciones', icon: ClipboardList },
  { id: 'evoluciones', label: 'Evoluciones', icon: NotebookPen },
  { id: 'altas', label: 'Altas', icon: LogOut },
  { id: 'reportes', label: 'Reportes', icon: FileText },
];

const CAMA_CLS: Record<string, string> = {
  disponible: 'bg-[var(--success-50)] border-[var(--success-200)] text-[var(--success-700)]',
  ocupado: 'bg-[var(--danger-50)] border-[var(--danger-200)] text-[var(--danger-700)]',
  reservado: 'bg-amber-50 border-amber-200 text-amber-700',
  limpieza: 'bg-[var(--primary-50)] border-[var(--primary-200)] text-[var(--primary-700)]',
  mantenimiento: 'bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-[var(--text-secondary)]',
};
const CAMA_LABEL: Record<string, string> = { disponible: 'Disponible', ocupado: 'Ocupada', reservado: 'Reservada', limpieza: 'En limpieza', mantenimiento: 'Mantenimiento' };
const ESTADO_HOSP: Record<string, string> = { admitido: 'Admitido', en_observacion: 'En observación', internado: 'Internado', alta: 'De alta', traslado: 'Traslado', fallecido: 'Fallecido' };

interface Nota { id: number; fecha: string; nota: string; plan?: string; indicaciones?: string; realizadoPorId?: number; createdAt?: string }
type Fila = Record<string, unknown>;

export default function HospitalizacionPage() {
  const { seccion = 'camas' } = useParams<{ seccion: Seccion }>();
  const navigate = useNavigate();
  const { pacientes, fetchPacientes, medicos, fetchMedicos } = useStore();
  const [hosp, setHosp] = useState<Hospitalizacion[]>([]);
  const [camas, setCamas] = useState<Cama[]>([]);
  const [stats, setStats] = useState<HospStats | null>(null);
  const [ingresoOpen, setIngresoOpen] = useState(false);
  const [altaTarget, setAltaTarget] = useState<Hospitalizacion | null>(null);
  const [notaTarget, setNotaTarget] = useState<Hospitalizacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [evolSel, setEvolSel] = useState<number | ''>('');
  const [notas, setNotas] = useState<Nota[]>([]);

  const ingresoForm = useForm();
  const altaForm = useForm();
  const notaForm = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [h, c, s] = await Promise.all([
        hospitalizacionService.getAll().catch(() => null),
        camaService.getAll().catch(() => null),
        hospitalizacionService.getStats().catch(() => null),
      ]);
      setHosp(lista<Hospitalizacion>(h)); setCamas(lista<Cama>(c)); setStats(s ? objeto<HospStats>(s) : null);
    } catch { toast('error', 'Error', 'No se pudo cargar hospitalización'); } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => { fetchPacientes(); fetchMedicos(); void load(); }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pName = (id: number) => { const p = pacientes.find((x) => x.id === id); return p ? `${p.nombre} ${p.apellido}` : `Paciente #${id}`; };
  const pCI = (id: number) => pacientes.find((x) => x.id === id)?.ci ?? '';
  const mName = (id: number) => { const m = medicos.find((x) => x.id === id); return m ? `Dr. ${m.nombre} ${m.apellido}` : `Médico #${id}`; };
  const cName = (id: number) => camas.find((x) => x.id === id)?.codigoCama ?? `Cama #${id}`;
  const activos = useMemo(() => hosp.filter((h) => h.estado !== 'alta' && !h.fechaAlta), [hosp]);
  const dadosDeAlta = useMemo(() => hosp.filter((h) => h.estado === 'alta' || !!h.fechaAlta).sort((a, b) => new Date(b.fechaAlta ?? 0).getTime() - new Date(a.fechaAlta ?? 0).getTime()), [hosp]);
  const camasLibres = camas.filter((c) => c.estado === 'disponible');

  // Paciente seleccionado en Evoluciones: el elegido o, por defecto, el primero internado.
  const evolActual = evolSel !== '' ? Number(evolSel) : activos[0]?.id ?? null;
  useEffect(() => {
    if (seccion !== 'evoluciones' || evolActual == null) return;
    let vivo = true;
    hospitalizacionService.getNotas(evolActual).then((r) => { if (vivo) setNotas(lista<Nota>(r)); }).catch(() => { if (vivo) setNotas([]); });
    return () => { vivo = false; };
  }, [seccion, evolActual]);

  const onIngreso = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      await hospitalizacionService.create({
        pacienteId: Number(data.pacienteId), medicoTratanteId: Number(data.medicoTratanteId), camaId: Number(data.camaId),
        fechaIngreso: new Date().toISOString(), motivoIngreso: data.motivoIngreso, diagnosticoIngreso: data.diagnosticoIngreso || undefined,
      });
      toast('success', 'Internación registrada', 'La cama quedó asignada al paciente');
      setIngresoOpen(false); load();
    } catch (e) { toast('error', 'No se pudo registrar la internación', errMsg(e)); } finally { setLoading(false); }
  };

  const onAlta = async (data: Record<string, string>) => {
    if (!altaTarget?.id) return;
    setLoading(true);
    try {
      await hospitalizacionService.alta(altaTarget.id, { fechaAlta: new Date().toISOString(), diagnosticoAlta: data.diagnosticoAlta || undefined, notasAlta: data.notasAlta || undefined });
      toast('success', 'Alta médica registrada', 'La cama fue liberada');
      setAltaTarget(null); load();
    } catch (e) { toast('error', 'No se pudo dar de alta', errMsg(e)); } finally { setLoading(false); }
  };

  const onNota = async (data: Record<string, string>) => {
    const target = notaTarget ?? activos.find((h) => h.id === evolActual);
    if (!target?.id) return;
    setLoading(true);
    try {
      await hospitalizacionService.addNota(target.id, { fecha: hoyIso(), nota: data.nota, plan: data.plan || undefined, indicaciones: data.indicaciones || undefined });
      toast('success', 'Evolución registrada');
      setNotaTarget(null); notaForm.reset();
      if (evolActual === target.id) hospitalizacionService.getNotas(target.id).then((r) => setNotas(lista<Nota>(r))).catch(() => {});
    } catch (e) { toast('error', 'No se pudo registrar la evolución', errMsg(e)); } finally { setLoading(false); }
  };

  const reportes: ReporteDefinicion[] = useMemo(() => [{
    id: 'hospitalizacion', titulo: 'Reporte de Hospitalización', descripcion: 'Pacientes internados, camas ocupadas y altas médicas del período.',
    cargar: async (p) => {
      const r = objeto<{ internados: { total: number; lista: Fila[] }; camas: { total: number; ocupadas: number; disponibles: number; porcentajeOcupacion: number; lista: Fila[] }; altas: { total: number; lista: Fila[] } }>(await reportesService.hospitalizacion(p));
      const s: SeccionReporte[] = [
        { titulo: 'Pacientes internados', resumen: [{ label: 'Internados', value: r.internados.total }],
          columnas: [{ key: 'fechaIngreso', header: 'Ingreso', format: (f) => fmtFecha(f.fechaIngreso as string) }, { key: 'paciente', header: 'Paciente' }, { key: 'ci', header: 'CI' }, { key: 'cama', header: 'Cama' }, { key: 'servicio', header: 'Servicio' }, { key: 'medico', header: 'Médico' }, { key: 'diagnostico', header: 'Diagnóstico' }],
          filas: r.internados.lista },
        { titulo: 'Camas ocupadas', resumen: [{ label: 'Camas', value: r.camas.total }, { label: 'Ocupadas', value: r.camas.ocupadas }, { label: 'Disponibles', value: r.camas.disponibles }, { label: 'Ocupación', value: `${r.camas.porcentajeOcupacion}%` }],
          columnas: [{ key: 'codigo', header: 'Cama' }, { key: 'servicio', header: 'Servicio' }, { key: 'piso', header: 'Piso' }, { key: 'estado', header: 'Estado', format: (f) => CAMA_LABEL[String(f.estado)] ?? String(f.estado) }],
          filas: r.camas.lista },
        { titulo: 'Altas médicas', resumen: [{ label: 'Altas', value: r.altas.total }],
          columnas: [{ key: 'fechaIngreso', header: 'Ingreso', format: (f) => fmtFecha(f.fechaIngreso as string) }, { key: 'fechaAlta', header: 'Alta', format: (f) => fmtFecha(f.fechaAlta as string) }, { key: 'dias', header: 'Días', align: 'right' }, { key: 'paciente', header: 'Paciente' }, { key: 'medico', header: 'Médico' }, { key: 'diagnosticoAlta', header: 'Diagnóstico de alta' }],
          filas: r.altas.lista },
      ];
      return s;
    },
  }], []);

  const kpis = [
    { label: 'Camas totales', value: stats?.totalCamas ?? camas.length },
    { label: 'Ocupadas', value: stats?.ocupadas ?? camas.filter((c) => c.estado === 'ocupado').length },
    { label: 'Disponibles', value: stats?.disponibles ?? camasLibres.length },
    { label: '% Ocupación', value: `${stats?.ocupacion ?? (camas.length ? Math.round((camas.filter((c) => c.estado === 'ocupado').length / camas.length) * 100) : 0)}%` },
  ];

  const btnIngreso = (
    <Button onClick={() => { ingresoForm.reset({ pacienteId: '', medicoTratanteId: '', camaId: '', motivoIngreso: '', diagnosticoIngreso: '' }); setIngresoOpen(true); }} disabled={camasLibres.length === 0} title={camasLibres.length === 0 ? 'No hay camas disponibles' : undefined}>
      <Plus className="w-4 h-4" />Nueva internación
    </Button>
  );

  const colInternaciones: Column<Hospitalizacion>[] = [
    { key: 'fechaIngreso', header: 'Ingreso', render: (h) => <span className="tabular-nums whitespace-nowrap">{fmtFecha(h.fechaIngreso, true)}</span> },
    { key: 'pacienteId', header: 'Paciente', render: (h) => <><p className="font-medium text-[var(--text-primary)]">{pName(h.pacienteId)}</p><p className="text-xs text-[var(--text-tertiary)]">CI {pCI(h.pacienteId) || '—'}</p></> },
    { key: 'camaId', header: 'Cama', render: (h) => <span className="font-semibold">{cName(h.camaId)}</span> },
    { key: 'medicoTratanteId', header: 'Médico responsable', render: (h) => mName(h.medicoTratanteId) },
    { key: 'diagnosticoIngreso', header: 'Diagnóstico', truncate: true, render: (h) => h.diagnosticoIngreso || h.motivoIngreso || '—' },
    { key: 'estado', header: 'Estado', render: (h) => <Badge variant="info">{ESTADO_HOSP[h.estado] || h.estado}</Badge> },
    { key: 'acciones', header: 'Acciones', align: 'right', hideable: false, render: (h) => (
      <div className="inline-flex gap-1 justify-end">
        <Button size="sm" variant="secondary" onClick={() => { notaForm.reset({ nota: '', plan: '', indicaciones: '' }); setNotaTarget(h); }}><NotebookPen className="w-4 h-4" />Evolución</Button>
        <Button size="sm" onClick={() => { altaForm.reset({ diagnosticoAlta: '', notasAlta: '' }); setAltaTarget(h); }}><LogOut className="w-4 h-4" />Alta</Button>
      </div>
    ) },
  ];

  const colAltas: Column<Hospitalizacion>[] = [
    { key: 'fechaAlta', header: 'Alta', render: (h) => <span className="tabular-nums">{fmtFecha(h.fechaAlta ?? undefined, true)}</span> },
    { key: 'pacienteId', header: 'Paciente', render: (h) => <span className="font-medium">{pName(h.pacienteId)}</span> },
    { key: 'fechaIngreso', header: 'Ingreso', render: (h) => <span className="tabular-nums">{fmtFecha(h.fechaIngreso)}</span> },
    { key: 'medicoTratanteId', header: 'Médico', render: (h) => mName(h.medicoTratanteId) },
    { key: 'diagnosticoAlta', header: 'Diagnóstico de alta', render: (h) => (h as unknown as { diagnosticoAlta?: string }).diagnosticoAlta || '—' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader icon={BedDouble} title="Hospitalización" subtitle="Control de camas, internaciones, evolución diaria y altas médicas"
        stats={[{ label: 'internados', value: activos.length }, { label: 'camas libres', value: camasLibres.length }]}
        action={<div className="flex gap-2"><Button variant="secondary" onClick={load} loading={loading}><RefreshCw className="w-4 h-4" /></Button>{seccion !== 'reportes' && btnIngreso}</div>} />

      <div className="flex gap-1 p-1 bg-[var(--bg-tertiary)] rounded-xl overflow-x-auto">
        {SECCIONES.map((s) => (
          <button key={s.id} onClick={() => navigate(`/hospitalizacion/${s.id}`)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${seccion === s.id ? 'bg-[var(--bg-primary)] text-[var(--primary-600)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}>
            <s.icon className="w-4 h-4" />{s.label}
          </button>
        ))}
      </div>

      {seccion === 'camas' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => <Card key={k.label}><p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">{k.label}</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{k.value}</p></Card>)}
          </div>
          <Card title="Estado de camas" subtitle="Verde: disponible · Rojo: ocupada · Azul: en limpieza">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {camas.map((c) => {
                const h = activos.find((x) => x.camaId === c.id);
                return (
                  <div key={c.id} className={`rounded-lg border p-3 ${CAMA_CLS[c.estado] || 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'}`}>
                    <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 font-semibold text-sm"><BedDouble className="w-4 h-4" />{c.codigoCama}</span><span className="text-[11px] font-medium">{CAMA_LABEL[c.estado] ?? c.estado}</span></div>
                    <p className="text-xs mt-1">{c.servicio}{c.piso ? ` · Piso ${c.piso}` : ''}</p>
                    {h && <p className="text-xs mt-1 font-medium truncate" title={pName(h.pacienteId)}>{pName(h.pacienteId)}</p>}
                  </div>
                );
              })}
              {camas.length === 0 && <p className="col-span-full text-sm text-center py-6 text-[var(--text-tertiary)]">No hay camas configuradas. El administrador las registra en Configuración.</p>}
            </div>
          </Card>
        </>
      )}

      {seccion === 'internaciones' && (
        <Card title="Pacientes internados" subtitle="Fecha de ingreso, diagnóstico, médico responsable y cama asignada" className="!p-0 overflow-hidden">
          <DataTable
            columns={colInternaciones}
            data={activos}
            keyExtractor={(h) => h.id}
            loading={loading && activos.length === 0}
            pageSize={10}
            searchable={activos.length > 5}
            searchPlaceholder="Buscar internado..."
            emptyMessage="No hay pacientes internados"
          />
        </Card>
      )}

      {seccion === 'evoluciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Paciente internado">
            {activos.length === 0 ? <p className="text-sm text-[var(--text-tertiary)]">No hay pacientes internados</p> : (
              <div className="space-y-1">
                {activos.map((h) => (
                  <button key={h.id} onClick={() => setEvolSel(h.id)} className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${evolActual === h.id ? 'border-[var(--primary-300)] bg-[var(--primary-50)]' : 'border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]'}`}>
                    <p className="font-medium text-[var(--text-primary)]">{pName(h.pacienteId)}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{cName(h.camaId)} · desde {fmtFecha(h.fechaIngreso)}</p>
                  </button>
                ))}
              </div>
            )}
          </Card>
          <Card className="lg:col-span-2" title="Seguimiento diario" subtitle={evolActual != null ? `${pName(activos.find((h) => h.id === evolActual)?.pacienteId ?? 0)} · ${notas.length} nota(s)` : 'Seleccione un paciente'}
            action={evolActual != null && <Button size="sm" onClick={() => { notaForm.reset({ nota: '', plan: '', indicaciones: '' }); setNotaTarget(activos.find((h) => h.id === evolActual) ?? null); }}><Plus className="w-4 h-4" />Registrar evolución</Button>}>
            {evolActual == null ? null : notas.length === 0 ? <p className="text-sm text-center py-8 text-[var(--text-tertiary)]">Sin evoluciones registradas todavía</p> : (
              <div className="space-y-3">
                {[...notas].sort((a, b) => new Date(b.createdAt ?? b.fecha).getTime() - new Date(a.createdAt ?? a.fecha).getTime()).map((n, i) => (
                  <div key={n.id ?? i} className="rounded-lg border border-[var(--border-primary)] p-3">
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">{fmtFecha(n.createdAt ?? n.fecha, !!n.createdAt)}</p>
                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{n.nota}</p>
                    {n.plan && <p className="text-sm mt-1"><span className="font-medium">Plan:</span> {n.plan}</p>}
                    {n.indicaciones && <p className="text-sm mt-1"><span className="font-medium">Indicaciones:</span> {n.indicaciones}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {seccion === 'altas' && (
        <>
          <Card title="Internados: dar de alta" subtitle="El alta médica libera la cama" className="!p-0 overflow-hidden">
            <table className="table-premium w-full text-sm">
              <thead><tr><th>Paciente</th><th>Cama</th><th>Ingreso</th><th>Médico</th><th className="text-right">Acción</th></tr></thead>
              <tbody>
                {activos.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-[var(--text-tertiary)]">No hay pacientes internados</td></tr>}
                {activos.map((h) => (
                  <tr key={h.id}><td className="font-medium">{pName(h.pacienteId)}</td><td>{cName(h.camaId)}</td><td className="tabular-nums">{fmtFecha(h.fechaIngreso)}</td><td>{mName(h.medicoTratanteId)}</td>
                    <td className="text-right"><Button size="sm" onClick={() => { altaForm.reset({ diagnosticoAlta: '', notasAlta: '' }); setAltaTarget(h); }}><LogOut className="w-4 h-4" />Dar de alta</Button></td></tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title="Altas registradas" subtitle={`${dadosDeAlta.length} alta(s)`} className="!p-0 overflow-hidden">
            <DataTable
              columns={colAltas}
              data={dadosDeAlta}
              keyExtractor={(h) => h.id}
              loading={loading && dadosDeAlta.length === 0}
              pageSize={10}
              searchable={dadosDeAlta.length > 5}
              searchPlaceholder="Buscar alta..."
              emptyMessage="Sin altas registradas"
            />
          </Card>
        </>
      )}

      {seccion === 'reportes' && <ReportePanel reportes={reportes} />}

      <Modal isOpen={ingresoOpen} onClose={() => setIngresoOpen(false)} title="Nueva internación" size="lg">
        <form onSubmit={ingresoForm.handleSubmit(onIngreso as never)} className="space-y-5">
          <FormSection title="Datos del ingreso" color="blue">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Paciente" placeholder="Seleccionar..." required options={(pacientes || []).filter((p) => p.id !== undefined).map((p) => ({ value: p.id!, label: `${p.nombre} ${p.apellido} — ${p.ci}` }))}
                error={ingresoForm.formState.errors.pacienteId?.message as string} {...ingresoForm.register('pacienteId', { required: 'Paciente requerido' })} />
              <Select label="Médico responsable" placeholder="Seleccionar..." required options={(medicos || []).filter((m) => m.id !== undefined).map((m) => ({ value: m.id!, label: `Dr. ${m.nombre} ${m.apellido}` }))}
                error={ingresoForm.formState.errors.medicoTratanteId?.message as string} {...ingresoForm.register('medicoTratanteId', { required: 'Médico requerido' })} />
              <Select label="Cama asignada" placeholder="Seleccionar..." required options={camasLibres.map((c) => ({ value: c.id, label: `${c.codigoCama} — ${c.servicio}` }))}
                error={ingresoForm.formState.errors.camaId?.message as string} {...ingresoForm.register('camaId', { required: 'Cama requerida' })} />
              <Input label="Fecha de ingreso" value={new Date().toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} readOnly />
            </div>
          </FormSection>
          <div className="border-t border-[var(--border-secondary)] pt-5 space-y-4">
            <Input label="Motivo de internación" placeholder="Motivo" required error={ingresoForm.formState.errors.motivoIngreso?.message as string} {...ingresoForm.register('motivoIngreso', { required: 'Motivo requerido' })} />
            <Textarea label="Diagnóstico de ingreso" placeholder="Diagnóstico presuntivo o CIE-10" {...ingresoForm.register('diagnosticoIngreso')} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-secondary)]">
            <Button type="button" variant="secondary" onClick={() => setIngresoOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={loading}>Registrar internación</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!altaTarget} onClose={() => setAltaTarget(null)} title="Alta médica" size="md">
        {altaTarget && <p className="text-sm text-[var(--text-secondary)] mb-4">Paciente: <strong>{pName(altaTarget.pacienteId)}</strong> · {cName(altaTarget.camaId)} · la cama quedará disponible.</p>}
        <form onSubmit={altaForm.handleSubmit(onAlta as never)} className="space-y-4">
          <Textarea label="Diagnóstico de alta" placeholder="Diagnóstico final" {...altaForm.register('diagnosticoAlta')} />
          <Textarea label="Indicaciones de alta" placeholder="Indicaciones al paciente" {...altaForm.register('notasAlta')} />
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-secondary)]">
            <Button type="button" variant="secondary" onClick={() => setAltaTarget(null)}>Cancelar</Button>
            <Button type="submit" loading={loading}>Confirmar alta</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!notaTarget} onClose={() => setNotaTarget(null)} title="Registrar evolución" size="md">
        {notaTarget && <p className="text-sm text-[var(--text-secondary)] mb-4">Paciente: <strong>{pName(notaTarget.pacienteId)}</strong> · {cName(notaTarget.camaId)}</p>}
        <form onSubmit={notaForm.handleSubmit(onNota as never)} className="space-y-4">
          <Textarea label="Evolución del día" placeholder="Estado clínico, signos, respuesta al tratamiento" required error={notaForm.formState.errors.nota?.message as string} {...notaForm.register('nota', { required: 'La evolución es requerida' })} />
          <Textarea label="Plan" placeholder="Plan de manejo (opcional)" {...notaForm.register('plan')} />
          <Textarea label="Indicaciones" placeholder="Indicaciones (opcional)" {...notaForm.register('indicaciones')} />
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-secondary)]">
            <Button type="button" variant="secondary" onClick={() => setNotaTarget(null)}>Cancelar</Button>
            <Button type="submit" loading={loading}>Guardar evolución</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
