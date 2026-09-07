import { useEffect, useState, useRef } from 'react';
import { Pill, Eye, Printer, FileText, AlertTriangle, Plus, X, Search } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { Button, Badge, Modal, Select, Textarea, Card, PharmaAlertList, FilterBar } from '../components/ui';
import type { PharmaSeverity, FilterChip } from '../components/ui';
import PageHeader from '../components/ui/PageHeader';
import { toast } from '../components/ui/Toast';
import { recetaService, alergiaService } from '../api/services';
import { useStore } from '../store';
import type { Receta, RecetaMedicamento, Medicamento, Alergia } from '../types';

const RECETAS_PRINT_STYLES = `
@media print {
  @page { size: A4 portrait; margin: 14mm 16mm; }
  html, body { background: #fff !important; }
  body * { visibility: hidden; }
  #receta-print-area, #receta-print-area * { visibility: visible; }
  #receta-print-area {
    position: absolute; left: 0; top: 0;
    width: 100% !important; max-width: none !important;
    min-height: auto !important; margin: 0 !important;
    padding: 0 !important; box-shadow: none !important;
    background: #fff !important; color: #000 !important;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  #receta-print-area img { max-width: 3cm; }
}
`;

interface RecetaPrintData {
  paciente: string;
  medico: string;
  fecha: string;
  instrucciones?: string;
  medicamentos: Array<{
    medNombre?: string;
    nombre?: string;
    medicamento?: { nombre?: string };
    dosis?: string;
    frecuencia?: string;
    duracion?: string;
    cantidad?: number;
    observaciones?: string;
  }>;
}

function RecetaPrintView({ receta }: { receta: RecetaPrintData }) {
  const fecha = new Date(receta.fecha);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
  const anio = fecha.getFullYear();
  return (
    <div id="receta-print-area" style={{ fontFamily: "'Times New Roman', Times, serif", color: '#000', background: '#fff', position: 'relative', width: '100%', maxWidth: '800px', minHeight: '24cm', margin: '0 auto', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', padding: '40px 48px' }}>
      {/* Watermark */}
      <img src="/receta-watermark.png" alt="" style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)', width: '70%', height: 'auto', opacity: 0.08, zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '22cm' }}>

        {/* ===== SECCIÓN 1: ENCABEZADO ===== */}
        <div style={{ textAlign: 'center' }}>
          <img src="/logo-receta.png" alt="Logo" style={{ width: '2.2cm', height: '2.2cm', objectFit: 'contain', display: 'block', margin: '0 auto 6px' }} />
          <p style={{ fontSize: 16, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: 1.5 }}>CENTRO MEDICO "SANTA ISABEL"</p>
          <p style={{ fontSize: 7.5, margin: '5px 0 0', color: '#333', lineHeight: 1.4, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Atención en las siguientes especialidades: Ginecología obstetricia- Medicina Interna - Cirugía · Pediatría- Medicina General · Ecografía Abdominal transversal y obstétrica · Sueros y curaciones
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '10px 0 14px' }} />

        {/* ===== SECCIÓN 2: DATOS DE LA RECETA ===== */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 10 }}>
          <div>
            <p style={{ margin: '0 0 3px' }}><strong>Paciente:</strong> {receta.paciente || '—'}</p>
            <p style={{ margin: 0 }}><strong>Fecha:</strong> {dia} de {mes} de {anio}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0 }}><strong>Médico:</strong> {receta.medico || '—'}</p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #999', margin: '0 0 16px' }} />

        {/* ===== SECCIÓN 3: PRESCRIPCIÓN ===== */}
        <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 14px' }}>R/p.</p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #000' }}>
              <th style={{ padding: '5px 8px', fontSize: 9, fontWeight: 700, textAlign: 'center', width: 30 }}>N°</th>
              <th style={{ padding: '5px 8px', fontSize: 9, fontWeight: 700, textAlign: 'center' }}>Medicamento</th>
              <th style={{ padding: '5px 8px', fontSize: 9, fontWeight: 700, textAlign: 'center' }}>Dosis</th>
              <th style={{ padding: '5px 8px', fontSize: 9, fontWeight: 700, textAlign: 'center' }}>Frecuencia</th>
              <th style={{ padding: '5px 8px', fontSize: 9, fontWeight: 700, textAlign: 'center' }}>Duración</th>
              <th style={{ padding: '5px 8px', fontSize: 9, fontWeight: 700, textAlign: 'center', width: 40 }}>Cant.</th>
            </tr>
          </thead>
          <tbody>
            {receta.medicamentos?.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '5px 8px', fontSize: 10.5, textAlign: 'center' }}>{i + 1}</td>
                <td style={{ padding: '5px 8px', fontSize: 10.5, fontWeight: 600, textAlign: 'center' }}>{m.medNombre || m.medicamento?.nombre || m.nombre}</td>
                <td style={{ padding: '5px 8px', fontSize: 10.5, textAlign: 'center' }}>{m.dosis || '-'}</td>
                <td style={{ padding: '5px 8px', fontSize: 10.5, textAlign: 'center' }}>{m.frecuencia ? `c/${m.frecuencia}` : '-'}</td>
                <td style={{ padding: '5px 8px', fontSize: 10.5, textAlign: 'center' }}>{m.duracion || '-'}</td>
                <td style={{ padding: '5px 8px', fontSize: 10.5, textAlign: 'center' }}>{m.cantidad || 1}</td>
              </tr>
            ))}
            {(!receta.medicamentos || receta.medicamentos.length === 0) && (
              <tr>
                <td colSpan={6} style={{ padding: 10, fontSize: 10, color: '#999', textAlign: 'center', fontStyle: 'italic' }}>Sin medicamentos prescritos</td>
              </tr>
            )}
          </tbody>
        </table>

        {receta.instrucciones && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 9, fontWeight: 700, margin: '0 0 3px', textTransform: 'uppercase' }}>Indicaciones:</p>
            <p style={{ fontSize: 10, margin: 0, fontStyle: 'italic', color: '#333' }}>{receta.instrucciones}</p>
          </div>
        )}

        {receta.medicamentos?.some((m) => m.observaciones) && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 9, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase' }}>Observaciones:</p>
            {receta.medicamentos.filter((m) => m.observaciones).map((m, i) => (
              <p key={i} style={{ fontSize: 10, margin: '2px 0', paddingLeft: 8, borderLeft: '2px solid #999' }}>
                <strong>{m.medNombre || m.nombre}:</strong> {m.observaciones}
              </p>
            ))}
          </div>
        )}

        {/* ===== SECCIÓN 4: FIRMA Y PIE DE PÁGINA (al fondo) ===== */}
        <div style={{ marginTop: 'auto' }}>
          <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '0 0 10px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: 10, margin: '0 0 2px' }}>Oruro, {dia} de {mes} de {anio}</p>
              <p style={{ fontSize: 10, margin: 0 }}>_________________________</p>
              <p style={{ fontSize: 9, margin: '2px 0 0', fontWeight: 600 }}>{receta.medico || 'Médico'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 9, margin: '0 0 2px', fontWeight: 600 }}>CENTRO MEDICO "SANTA ISABEL"</p>
              <p style={{ fontSize: 8.5, margin: 0, color: '#555' }}>Bolivar esq. Tarapacá · 68283500 · 61813407</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function RecetasPage() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceta, setSelectedReceta] = useState<Receta | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewReceta, setPreviewReceta] = useState<RecetaPrintData | null>(null);

  /* ── Filtros ── */
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchPaciente, setSearchPaciente] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  /* ── Dar de baja ── */
  const [showBajaModal, setShowBajaModal] = useState(false);
  const [recetaToBaja, setRecetaToBaja] = useState<Receta | null>(null);

  const { pacientes, medicos, fetchMedicos, fetchPacientes } = useStore();
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [pacienteNombre, setPacienteNombre] = useState('');
  const [medicoNombre, setMedicoNombre] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [medicamentos, setMedicamentos] = useState<Array<{
    medicamentoId: string;
    nombre: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
    cantidad: number;
    observaciones: string;
  }>>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [alergiaWarnings, setAlergiaWarnings] = useState<Alergia[]>([]);
  const [showAlergiaModal, setShowAlergiaModal] = useState(false);
  const [medicamentosDisponibles, setMedicamentosDisponibles] = useState<Medicamento[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  /* ── Recetas filtradas ── */
  const filteredRecetas = recetas.filter(r => {
    if (filterEstado && r.estado !== filterEstado) return false;
    if (searchPaciente) {
      const nombre = `${r.consulta?.paciente?.nombre || ''} ${r.consulta?.paciente?.apellido || ''}`.toLowerCase();
      if (!nombre.includes(searchPaciente.toLowerCase())) return false;
    }
    if (dateFrom && r.createdAt) {
      if (new Date(r.createdAt) < new Date(dateFrom)) return false;
    }
    if (dateTo && r.createdAt) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(r.createdAt) > toDate) return false;
    }
    return true;
  });

  const cleanFilters = () => {
    setDateFrom(''); setDateTo(''); setSearchPaciente(''); setFilterEstado('');
  };

  const recetaChips: FilterChip[] = [
    { value: '', label: 'Todas', count: recetas.length },
    { value: 'activa', label: 'Activas', count: recetas.filter((r) => r.estado === 'activa').length },
    { value: 'dispensada_parcial', label: 'Dispensada parcial', count: recetas.filter((r) => r.estado === 'dispensada_parcial').length },
    { value: 'dispensada_total', label: 'Dispensadas', count: recetas.filter((r) => r.estado === 'dispensada_total').length },
    { value: 'cancelada', label: 'Canceladas', count: recetas.filter((r) => r.estado === 'cancelada').length, activeBg: 'var(--danger-100)', activeText: 'var(--danger-700)', activeBorder: 'var(--danger-300)' },
  ];

  useEffect(() => { fetchMedicos(); fetchPacientes(); }, [fetchMedicos, fetchPacientes]);

  useEffect(() => {
    let cancelado = false;
    recetaService.searchMedicamentos('').then(res => {
      if (!cancelado) setMedicamentosDisponibles(res.data || []);
    }).catch(() => { /* sin catálogo disponible */ });
    return () => { cancelado = true; };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!medicoNombre && medicos.length > 0) {
      const m = medicos[0];
      queueMicrotask(() => setMedicoNombre(`Dr. ${m.nombre} ${m.apellido}`));
    }
  }, [medicos, medicoNombre]);

  const loadRecetas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await recetaService.getAll();
      setRecetas(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message || err?.message || 'Error al cargar recetas');
      setRecetas([]);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await recetaService.getAll();
        if (!cancelado) setRecetas(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelado) { setError('Error al cargar recetas'); setRecetas([]); }
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  /* ── Dar de baja ── */
  const handleDarDeBaja = (r: Receta) => {
    setRecetaToBaja(r);
    setShowBajaModal(true);
  };
  const confirmarBaja = async () => {
    if (!recetaToBaja?.id) return;
    try {
      await recetaService.update(recetaToBaja.id, { estado: 'cancelada' });
      toast('success', 'Receta cancelada', 'La receta ha sido dada de baja correctamente');
      setShowBajaModal(false);
      setRecetaToBaja(null);
      loadRecetas();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo cancelar la receta';
      toast('error', 'Error', msg);
    }
  };

  const addMedicamento = () => {
    setMedicamentos([...medicamentos, {
      medicamentoId: '', nombre: '', dosis: '', frecuencia: '', duracion: '', cantidad: 1, observaciones: '',
    }]);
    setFormErrors(prev => ({ ...prev, medicamentos: '' }));
  };

  const updateMedicamento = (idx: number, field: string, value: string | number) => {
    const updated = [...medicamentos];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'medicamentoId') {
      const med = medicamentosDisponibles.find(m => m.id === Number(value));
      if (med) updated[idx].nombre = med.nombre;
    }
    setMedicamentos(updated);
  };

  const removeMedicamento = (idx: number) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== idx));
  };

  const handlePreview = async () => {
    const errors: Record<string, string> = {};
    if (!selectedPatientId) errors.pacienteNombre = 'Seleccione un paciente';
    if (medicamentos.length === 0) errors.medicamentos = 'Debe agregar al menos un medicamento';
    medicamentos.forEach((med, idx) => {
      if (!med.medicamentoId) errors[`medicamentoId_${idx}`] = 'Seleccione un medicamento';
      if (!med.dosis.trim()) errors[`dosis_${idx}`] = 'La dosis es requerida';
      if (!med.frecuencia.trim()) errors[`frecuencia_${idx}`] = 'La frecuencia es requerida';
    });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const medNombres = medicamentos.map(m =>
      m.nombre || medicamentosDisponibles.find(d => d.id === Number(m.medicamentoId))?.nombre || ''
    ).filter(Boolean);

    let alergias: Alergia[] = [];
    try {
      const res = await alergiaService.getByPaciente(selectedPatientId!);
      alergias = res.data;
    } catch { /* paciente sin alergias registradas */ }

    const conflictos = alergias.filter(a =>
      medNombres.some(mn => mn.toLowerCase().includes(a.nombre?.toLowerCase() || ''))
    );
    if (conflictos.length > 0) {
      setAlergiaWarnings(conflictos);
      setShowAlergiaModal(true);
      return;
    }

    setPreviewReceta({
      paciente: pacienteNombre,
      medico: medicoNombre,
      fecha: new Date().toISOString(),
      instrucciones,
      medicamentos: medicamentos.map(m => ({
        ...m,
        medNombre: m.nombre || medicamentosDisponibles.find(d => d.id === Number(m.medicamentoId))?.nombre || 'Medicamento',
      })),
    });
    setShowPreview(true);
  };

  const handleEmitir = async () => {
    toast('success', 'Receta emitida exitosamente', 'Puede imprimirla desde el listado');
    setShowPreview(false);
    setShowModal(false);
    setMedicamentos([]);
    setPacienteNombre('');
    setSelectedPatientId(null);
    setSearchTerm('');
    setInstrucciones('');
    loadRecetas();
  };

  const handleEmitirConAlergia = () => {
    setShowAlergiaModal(false);
    setPreviewReceta({
      paciente: pacienteNombre,
      medico: medicoNombre,
      fecha: new Date().toISOString(),
      instrucciones,
      medicamentos: medicamentos.map(m => ({
        ...m,
        medNombre: m.nombre || medicamentosDisponibles.find(d => d.id === Number(m.medicamentoId))?.nombre || 'Medicamento',
      })),
    });
    setShowPreview(true);
  };

  const estadoBadge = (estado?: string) => {
    const map: Record<string, { variant: 'success' | 'warning' | 'info' | 'danger' | 'neutral', label: string }> = {
      activa: { variant: 'success', label: 'Activa' },
      dispensada_parcial: { variant: 'warning', label: 'Parcial' },
      dispensada_total: { variant: 'info', label: 'Dispensada' },
      cancelada: { variant: 'danger', label: 'Cancelada' },
    };
    const e = map[estado || ''] || { variant: 'neutral' as const, label: estado || '—' };
    return <Badge variant={e.variant}>{e.label}</Badge>;
  };

  type RecetaRow = Receta & { pacienteNombre?: string; medicoNombre?: string };

  const columns: Column<Receta>[] = [
    { key: 'fecha', header: 'Fecha', sortable: true, render: (r) => (
      <span className="text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">
        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
      </span>
    )},
    { key: 'paciente', header: 'Paciente', sortable: true, render: (r) => {
      const nombre = (r as RecetaRow).pacienteNombre || (r.consulta?.paciente ? `${r.consulta.paciente.nombre} ${r.consulta.paciente.apellido}` : '');
      const ini = nombre ? nombre.split(' ').slice(0, 2).map((s: string) => s.charAt(0)).join('') : '?';
      return (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[var(--danger-500)] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">{ini}</div>
          <span className="font-medium text-[var(--text-primary)] truncate max-w-[180px]">{nombre || '—'}</span>
        </div>
      );
    }},
    { key: 'medico', header: 'Médico', render: (r) => {
      const nombre = (r as RecetaRow).medicoNombre || (r.consulta?.medico ? `${r.consulta.medico.nombre} ${r.consulta.medico.apellido}` : '');
      return <span className="text-sm text-[var(--text-secondary)]">{nombre ? `Dr. ${nombre}` : '—'}</span>;
    }},
    { key: 'medicamentos', header: 'Medicamentos', render: (r) => (
      <div className="flex flex-wrap gap-1 max-w-[220px]">
        {(!r.items || r.items.length === 0) ? (
          <span className="text-xs text-[var(--text-tertiary)]">Sin medicamentos</span>
        ) : (
          <>
            {r.items.slice(0, 3).map((item: RecetaMedicamento, i: number) => (
              <Badge key={item.id || i} variant="neutral" className="text-[10px]">{item.medicamento?.nombre || 'N/A'}</Badge>
            ))}
            {r.items.length > 3 && (
              <Badge variant="primary" className="text-[10px]">+{r.items.length - 3}</Badge>
            )}
          </>
        )}
      </div>
    )},
    { key: 'estado', header: 'Estado', sortable: true, render: (r) => estadoBadge(r.estado) },
    { key: 'acciones', header: '', align: 'right', width: '80px', render: (r) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="sm" icon onClick={() => { setSelectedReceta(r); setShowModal(true); }}>
          <Eye className="w-3.5 h-3.5" />
        </Button>
        {r.estado !== 'cancelada' && (
          <Button variant="ghost" size="sm" icon onClick={() => handleDarDeBaja(r)} className="hover:text-[var(--danger-500)]">
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="animate-in-up" style={{ animationDelay: '0ms' }}>
        <PageHeader
          icon={Pill}
          gradient="from-purple-500 to-purple-600"
          title="Recetas"
          subtitle="Gestión de recetas médicas"
          action={<Button variant="premium" onClick={() => { setShowModal(true); setMedicamentos([]); setPacienteNombre(''); setInstrucciones(''); setFormErrors({}); }}><Plus className="w-4 h-4" />Nueva Receta</Button>}
        />
      </div>

      {/* ── Barra de filtros ── */}
      <div className="animate-in-up" style={{ animationDelay: '75ms' }}>
        <FilterBar
          chips={recetaChips}
          chipValue={filterEstado}
          onChipChange={setFilterEstado}
          extraFilters={
            <>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Desde</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold outline-none transition-colors border"
                  style={{
                    backgroundColor: dateFrom ? 'var(--primary-100)' : 'var(--bg-secondary)',
                    color: dateFrom ? 'var(--primary-700)' : 'var(--text-secondary)',
                    borderColor: dateFrom ? 'var(--primary-200)' : 'transparent',
                    colorScheme: 'dark',
                  }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Hasta</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold outline-none transition-colors border"
                  style={{
                    backgroundColor: dateTo ? 'var(--primary-100)' : 'var(--bg-secondary)',
                    color: dateTo ? 'var(--primary-700)' : 'var(--text-secondary)',
                    borderColor: dateTo ? 'var(--primary-200)' : 'transparent',
                    colorScheme: 'dark',
                  }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Paciente</label>
                <input type="text" value={searchPaciente} onChange={(e) => setSearchPaciente(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-44 px-3 py-1.5 rounded-lg text-xs font-medium outline-none transition-colors bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border border-transparent focus:border-[var(--primary-300)]" />
              </div>
            </>
          }
          resultCount={filteredRecetas.length}
          totalCount={recetas.length}
          resultLabel="recetas"
          onClear={cleanFilters}
        />
      </div>

      {/* ── Tabla ── */}
      <div className="animate-in-up" style={{ animationDelay: '100ms' }}>
        <Card accent="accent">
          {error && !loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-10 h-10 text-[var(--danger-500)] mb-3" />
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">Error al cargar datos</p>
              <p className="text-xs text-[var(--text-secondary)] mb-4">{error}</p>
              <Button variant="secondary" size="sm" onClick={loadRecetas}>Reintentar</Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredRecetas}
              keyExtractor={(r) => r.id!}
              searchPlaceholder="Buscar en resultados..."
              searchKeys={['consulta.paciente.nombre', 'consulta.medico.nombre', 'items.medicamento.nombre', 'estado']}
              loading={loading}
              className="table-premium"
              onExportPdf={() => toast('info', 'Exportar PDF')}
              onExportExcel={() => toast('info', 'Exportar Excel')}
            />
          )}
        </Card>
      </div>

      {/* ── Modal Nueva Receta / Detalle ── */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedReceta(null); }} title={selectedReceta ? 'Detalle de Receta' : 'Nueva Receta Médica'} size={selectedReceta ? 'lg' : '2xl'} accent="rose">
        {selectedReceta ? (
          <div className="space-y-4">
            <RecetaPrintView receta={{
              paciente: `${selectedReceta.consulta?.paciente?.nombre || ''} ${selectedReceta.consulta?.paciente?.apellido || ''}`,
              medico: `Dr. ${selectedReceta.consulta?.medico?.nombre || ''} ${selectedReceta.consulta?.medico?.apellido || ''}`,
              fecha: selectedReceta.createdAt || new Date().toISOString(),
              instrucciones: selectedReceta.instrucciones,
              medicamentos: selectedReceta.items || [],
            }} />
            <div className="flex justify-center gap-3 pt-2">
              <Button onClick={() => window.print()}>
                <Printer className="w-4 h-4" />Imprimir Receta
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {!selectedReceta && <p className="text-sm text-[var(--text-secondary)] mb-4">Nueva receta para paciente</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div ref={searchRef} className="relative">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Paciente *</label>
                {selectedPatientId ? (
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--primary-50)] border-2 border-[var(--primary-200)] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{pacienteNombre}</p>
                    </div>
                    <button onClick={() => { setSelectedPatientId(null); setPacienteNombre(''); setSearchTerm(''); }} className="p-1 rounded-lg hover:bg-[var(--primary-100)] transition-colors">
                      <X className="w-4 h-4 text-[var(--primary-500)]" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setShowPatientDropdown(true); setSelectedPatientId(null); setPacienteNombre(''); setFormErrors(prev => ({ ...prev, pacienteNombre: '' })); }}
                        onFocus={() => setShowPatientDropdown(true)}
                        placeholder="Buscar paciente por nombre o cédula..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all"
                      />
                    </div>
                    {showPatientDropdown && searchTerm.length > 0 && (
                      <div className="absolute z-20 mt-1.5 w-full bg-[var(--bg-card)] rounded-lg shadow-dropdown border border-[var(--border-primary)] py-1 max-h-64 overflow-y-auto">
                        {pacientes.filter(p => `${p.nombre} ${p.apellido} ${p.ci}`.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                          pacientes.filter(p => `${p.nombre} ${p.apellido} ${p.ci}`.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                            <button
                              key={p.id}
                              onClick={() => { setSelectedPatientId(p.id!); setPacienteNombre(`${p.nombre} ${p.apellido}`); setSearchTerm(`${p.nombre} ${p.apellido} - ${p.ci}`); setShowPatientDropdown(false); setFormErrors(prev => ({ ...prev, pacienteNombre: '' })); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--primary-50)] transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-xs font-semibold text-[var(--text-tertiary)]">
                                {p.nombre.charAt(0)}{p.apellido?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-[var(--text-primary)]">{p.nombre} {p.apellido}</p>
                                <p className="text-xs text-[var(--text-tertiary)]">{p.ci}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-[var(--text-tertiary)] text-center">
                            <p>Paciente no encontrado</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {formErrors.pacienteNombre && <p className="text-xs text-[var(--danger-500)] font-medium mt-1">{formErrors.pacienteNombre}</p>}
              </div>
              <Select label="Médico" value={medicoNombre} onChange={e => setMedicoNombre(e.target.value)}
                options={[
                  ...medicos.map(m => ({
                    value: `Dr. ${m.nombre} ${m.apellido}`,
                    label: `Dr. ${m.nombre} ${m.apellido} - ${m.especialidad?.nombre || ''}`,
                  })),
                ]}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-rose-500" />
                  Medicamentos Prescritos
                </h4>
                <Button size="sm" variant="ghost" onClick={addMedicamento}>
                  <Plus className="w-3.5 h-3.5" />Agregar
                </Button>
              </div>

              {medicamentos.length === 0 ? (
                <Card accent="warning" className="text-center py-6 bg-[var(--bg-tertiary)]">
                  <Pill className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-tertiary)]">Agregue medicamentos a la receta</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {medicamentos.map((med, idx) => (
                    <div key={idx} className="animate-in-up p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]" style={{ animationDelay: `${idx * 80}ms` }}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase">Medicamento #{idx + 1}</span>
                        <Button variant="ghost" size="sm" icon onClick={() => removeMedicamento(idx)}>
                          <X className="w-3.5 h-3.5 text-[var(--danger-500)]" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Medicamento *</label>
                          <select value={med.medicamentoId} onChange={e => updateMedicamento(idx, 'medicamentoId', e.target.value)} className={`w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 rounded-md text-sm text-[var(--text-primary)] appearance-none cursor-pointer transition-all duration-200 outline-none border-[var(--border-primary)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] ${formErrors[`medicamentoId_${idx}`] ? 'border-[var(--danger-500)]' : ''}`}>
                            <option value="">Seleccionar...</option>
                            {medicamentosDisponibles.map(m => (
                              <option key={m.id} value={m.id}>{m.nombre} - {m.presentacion}</option>
                            ))}
                          </select>
                          {formErrors[`medicamentoId_${idx}`] && <p className="text-xs text-[var(--danger-500)] font-medium mt-1">{formErrors[`medicamentoId_${idx}`]}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Dosis *</label>
                          <input type="text" value={med.dosis} onChange={e => updateMedicamento(idx, 'dosis', e.target.value)} placeholder="500mg" className={`w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border-[var(--border-primary)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] outline-none transition-all duration-200 ${formErrors[`dosis_${idx}`] ? 'border-[var(--danger-500)]' : ''}`} />
                          {formErrors[`dosis_${idx}`] && <p className="text-xs text-[var(--danger-500)] font-medium mt-1">{formErrors[`dosis_${idx}`]}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Frecuencia *</label>
                          <select value={med.frecuencia} onChange={e => updateMedicamento(idx, 'frecuencia', e.target.value)} className={`w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 rounded-md text-sm text-[var(--text-primary)] appearance-none cursor-pointer transition-all duration-200 outline-none border-[var(--border-primary)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] ${formErrors[`frecuencia_${idx}`] ? 'border-[var(--danger-500)]' : ''}`}>
                            <option value="">Seleccionar...</option>
                            <option value="8 horas">Cada 8 horas</option>
                            <option value="12 horas">Cada 12 horas</option>
                            <option value="24 horas">Cada 24 horas</option>
                            <option value="6 horas">Cada 6 horas</option>
                            <option value="8 horas (prn)">Cada 8 horas (prn)</option>
                          </select>
                          {formErrors[`frecuencia_${idx}`] && <p className="text-xs text-[var(--danger-500)] font-medium mt-1">{formErrors[`frecuencia_${idx}`]}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Duración</label>
                          <input type="text" value={med.duracion} onChange={e => updateMedicamento(idx, 'duracion', e.target.value)} placeholder="7 días" className="w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border-[var(--border-primary)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] outline-none transition-all duration-200" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Cantidad</label>
                          <input type="number" value={med.cantidad} onChange={e => updateMedicamento(idx, 'cantidad', Number(e.target.value))} min="1" className="w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border-[var(--border-primary)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] outline-none transition-all duration-200" />
                        </div>
                        <div className="md:col-span-5">
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Observaciones</label>
                          <input type="text" value={med.observaciones} onChange={e => updateMedicamento(idx, 'observaciones', e.target.value)} placeholder="Ej: Tomar después de las comidas" className="w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border-[var(--border-primary)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] outline-none transition-all duration-200" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {formErrors.medicamentos && (
                <p className="text-xs text-[var(--danger-500)] font-medium mt-1">{formErrors.medicamentos}</p>
              )}
            </div>

            <Textarea label="Instrucciones Generales" placeholder="Indicaciones adicionales para el paciente..." value={instrucciones} onChange={e => setInstrucciones(e.target.value)} rows={2} />

            <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-primary)]">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button variant="premium" onClick={handlePreview}>
                <Eye className="w-4 h-4" />Vista Previa
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal Vista Previa ── */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Vista Previa de Receta" size="xl" accent="accent">
        {previewReceta && (
          <div className="space-y-6">
            <RecetaPrintView receta={previewReceta} />
            <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-primary)]">
              <Button variant="secondary" onClick={() => setShowPreview(false)}>Editar</Button>
              <Button variant="premium" onClick={handleEmitir}>
                <FileText className="w-4 h-4" />Emitir Receta
              </Button>
              <Button variant="premium" onClick={() => { handleEmitir(); setTimeout(() => window.print(), 500); }}>
                <Printer className="w-4 h-4" />Emitir e Imprimir
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal Alergias ── */}
      <Modal isOpen={showAlergiaModal} onClose={() => setShowAlergiaModal(false)} title="Alerta de Alergias" size="md" accent="warning">
        <div className="space-y-4">
          <PharmaAlertList
            alerts={alergiaWarnings.map((a) => ({
              severity: (a.severidad === 'severa' || a.severidad === 'anafilactica'
                ? 'contraindicado'
                : a.severidad === 'moderada'
                  ? 'grave'
                  : 'precaucion') as PharmaSeverity,
              title: `Alergia: ${a.nombre}`,
              detail: a.descripcion || 'El paciente tiene una alergia registrada que podría interactuar con los medicamentos prescritos.',
              source: 'Motor de seguridad farmacológica — registro único de alergias',
            }))}
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-primary)]">
            <Button variant="secondary" onClick={() => setShowAlergiaModal(false)}>Revisar medicamentos</Button>
            <Button variant="premium" onClick={handleEmitirConAlergia}>
              <FileText className="w-4 h-4" />Emitir de todas formas
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal Confirmar Baja ── */}
      <Modal isOpen={showBajaModal} onClose={() => { setShowBajaModal(false); setRecetaToBaja(null); }} title="Confirmar" size="sm" accent="danger">
        {recetaToBaja && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-[var(--danger-50)] rounded-lg border border-[var(--danger-200)]">
              <AlertTriangle className="w-5 h-5 text-[var(--danger-500)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[var(--danger-700)]">¿Dar de baja esta receta?</p>
                <p className="text-xs text-[var(--danger-600)] mt-1">
                  Paciente: {recetaToBaja.consulta?.paciente?.nombre || '—'} {recetaToBaja.consulta?.paciente?.apellido || ''}
                </p>
                <p className="text-xs text-[var(--danger-600)]">
                  Fecha: {recetaToBaja.createdAt ? new Date(recetaToBaja.createdAt).toLocaleDateString('es-ES') : '—'}
                </p>
                <p className="text-xs text-[var(--danger-500)] mt-2">La receta quedará con estado "Cancelada" y no podrá ser dispensada.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => { setShowBajaModal(false); setRecetaToBaja(null); }}>Volver</Button>
              <Button variant="danger" onClick={confirmarBaja}>Sí, dar de baja</Button>
            </div>
          </div>
        )}
      </Modal>

      <style>{RECETAS_PRINT_STYLES}</style>
    </div>
  );
}