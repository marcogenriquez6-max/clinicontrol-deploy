import { useEffect, useState } from 'react';
import { Thermometer, Plus, Printer } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card, Input, EsiBadge } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { useStore } from '../store';
import { triageService, type Triage } from '../api/triage.service';
import TriajeFormModal from '../components/clinico/TriajeFormModal';
import { lista, hoyIso, fechaLocalIso } from '../utils/api.utils';
import { fmtFecha, imprimirReporte } from '../utils/impresion';
import { errMsg } from '../api/errMsg';

/** Enfermería → Signos Vitales: registro y consulta de los signos tomados en triaje. */
export default function SignosVitalesPage() {
  const { pacientes, fetchPacientes } = useStore();
  const [registros, setRegistros] = useState<Triage[]>([]);
  const [fecha, setFecha] = useState(hoyIso());
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);

  const load = async () => {
    try {
      setRegistros(lista<Triage>(await triageService.getAll({ limit: 500 })));
    } catch (e) { toast('error', 'No se pudieron cargar los registros', errMsg(e)); }
  };

  useEffect(() => {
    const t = setTimeout(() => { fetchPacientes(); void load(); }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nombre = (id: number) => { const p = pacientes.find((x) => x.id === id); return p ? `${p.nombre} ${p.apellido}` : `Paciente #${id}`; };
  const ci = (id: number) => pacientes.find((x) => x.id === id)?.ci ?? '';

  const filtrados = registros
    .filter((r) => !fecha || fechaLocalIso(r.fechaHora) === fecha)
    .filter((r) => !busqueda || `${nombre(r.pacienteId)} ${ci(r.pacienteId)}`.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());

  const imprimir = () => imprimirReporte(
    'Registro de Signos Vitales',
    `Fecha: ${fecha ? fmtFecha(fecha + 'T00:00:00') : 'todas'}`,
    [{
      titulo: 'Signos vitales registrados',
      resumen: [{ label: 'registros', value: filtrados.length }],
      columnas: [
        { key: 'hora', header: 'Hora', format: (r) => fmtFecha(r.fechaHora as string, true) },
        { key: 'paciente', header: 'Paciente' },
        { key: 'ci', header: 'CI' },
        { key: 'temperatura', header: 'T° (°C)', align: 'right' },
        { key: 'presionArterial', header: 'PA' },
        { key: 'frecuenciaCardiaca', header: 'FC', align: 'right' },
        { key: 'saturacionOxigeno', header: 'SpO₂ %', align: 'right' },
        { key: 'peso', header: 'Peso kg', align: 'right' },
        { key: 'talla', header: 'Talla cm', align: 'right' },
        { key: 'esi', header: 'ESI', align: 'center', format: (r) => `ESI-${r.esiNivel}` },
      ],
      filas: filtrados.map((r) => ({ ...r, paciente: nombre(r.pacienteId), ci: ci(r.pacienteId) })) as unknown as Record<string, unknown>[],
    }],
    { registrar: { reporte: 'signos-vitales', detalle: fecha } },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Thermometer}
        title="Signos Vitales"
        subtitle="Temperatura, presión arterial, peso, talla, frecuencia cardíaca y saturación registrados en triaje"
        stats={[{ label: 'registros', value: filtrados.length }]}
        action={<div className="flex gap-2"><Button variant="secondary" onClick={imprimir} disabled={filtrados.length === 0}><Printer className="w-4 h-4" />Imprimir</Button><Button onClick={() => setModal(true)}><Plus className="w-4 h-4" />Nuevo registro</Button></div>}
      />

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Input label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          <div className="flex-1 min-w-[220px]"><Input label="Buscar paciente" placeholder="Nombre o CI" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></div>
          <Button variant="ghost" onClick={() => setFecha('')}>Ver todas las fechas</Button>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium w-full text-sm">
            <thead>
              <tr><th>Hora</th><th>Paciente</th><th className="text-right">T° (°C)</th><th>PA</th><th className="text-right">FC</th><th className="text-right">FR</th><th className="text-right">SpO₂</th><th className="text-right">Peso</th><th className="text-right">Talla</th><th className="text-center">ESI</th><th>Observaciones</th></tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && <tr><td colSpan={11} className="text-center py-10 text-[var(--text-tertiary)]">Sin registros para la fecha seleccionada</td></tr>}
              {filtrados.map((r) => (
                <tr key={r.id}>
                  <td className="tabular-nums whitespace-nowrap">{fmtFecha(r.fechaHora, true)}</td>
                  <td><p className="font-medium text-[var(--text-primary)]">{nombre(r.pacienteId)}</p><p className="text-xs text-[var(--text-tertiary)]">CI {ci(r.pacienteId) || '—'}</p></td>
                  <td className="text-right tabular-nums">{r.temperatura ?? '—'}</td>
                  <td className="tabular-nums">{r.presionArterial ?? '—'}</td>
                  <td className="text-right tabular-nums">{r.frecuenciaCardiaca ?? '—'}</td>
                  <td className="text-right tabular-nums">{r.frecuenciaRespiratoria ?? '—'}</td>
                  <td className="text-right tabular-nums">{r.saturacionOxigeno != null ? `${r.saturacionOxigeno}%` : '—'}</td>
                  <td className="text-right tabular-nums">{r.peso ?? '—'}</td>
                  <td className="text-right tabular-nums">{r.talla ?? '—'}</td>
                  <td className="text-center"><EsiBadge nivel={r.esiNivel} /></td>
                  <td className="text-xs text-[var(--text-secondary)] max-w-[260px] truncate" title={r.enfermedadActual ?? r.motivoConsulta ?? ''}>{r.enfermedadActual || r.motivoConsulta || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <TriajeFormModal isOpen={modal} onClose={() => setModal(false)} onSaved={load} pacientes={pacientes} titulo="Registrar signos vitales y triaje" />
    </div>
  );
}
