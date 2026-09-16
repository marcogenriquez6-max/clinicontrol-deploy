import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Printer, RefreshCw } from 'lucide-react';
import { Button, Input } from '../ui';
import { toast } from '../ui/Toast';
import { errMsg } from '../../api/errMsg';
import { useAuthStore } from '../../store/authStore';
import {
  imprimirReporte,
  periodoTexto,
  type SeccionReporte,
} from '../../utils/impresion';

export interface Periodo {
  fechaInicio: string;
  fechaFin: string;
}

export interface ReporteDefinicion {
  /** Identificador estable, se usa en auditoría. */
  id: string;
  titulo: string;
  descripcion?: string;
  /** Carga los datos y los transforma en secciones imprimibles. */
  cargar: (periodo: Periodo) => Promise<SeccionReporte[]>;
}

interface ReportePanelProps {
  reportes: ReporteDefinicion[];
  /** Texto del encabezado de la pantalla. */
  encabezado?: ReactNode;
  /** Muestra el filtro de fechas (por defecto sí). */
  conPeriodo?: boolean;
}

import { hoyIso } from '../../utils/api.utils';
const inicioMesIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

/**
 * Panel genérico de reportes: filtro de período, vista previa en pantalla e impresión.
 * Todos los reportes por rol del documento de grado usan este componente.
 */
export default function ReportePanel({ reportes, encabezado, conPeriodo = true }: ReportePanelProps) {
  const user = useAuthStore((s) => s.user);
  const [activo, setActivo] = useState(reportes[0]?.id ?? '');
  const [periodo, setPeriodo] = useState<Periodo>({ fechaInicio: inicioMesIso(), fechaFin: hoyIso() });
  const [secciones, setSecciones] = useState<SeccionReporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [imprimiendo, setImprimiendo] = useState(false);

  const def = reportes.find((r) => r.id === activo) ?? reportes[0];

  const generar = useCallback(async () => {
    if (!def) return;
    if (conPeriodo && periodo.fechaInicio > periodo.fechaFin) {
      toast('warning', 'Período inválido', 'La fecha inicial no puede ser posterior a la final');
      return;
    }
    setLoading(true);
    try {
      setSecciones(await def.cargar(periodo));
    } catch (e) {
      toast('error', 'No se pudo generar el reporte', errMsg(e, 'Intente nuevamente'));
      setSecciones([]);
    } finally {
      setLoading(false);
    }
  }, [def, periodo, conPeriodo]);

  useEffect(() => {
    const t = setTimeout(() => { void generar(); }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo]);

  const imprimir = async () => {
    if (!def) return;
    setImprimiendo(true);
    try {
      const ok = await imprimirReporte(
        def.titulo,
        conPeriodo ? periodoTexto(periodo.fechaInicio, periodo.fechaFin) : `Emitido el ${new Date().toLocaleDateString('es-BO')}`,
        secciones,
        { registrar: { reporte: def.id, detalle: def.titulo }, usuario: user?.nombre },
      );
      if (!ok) toast('warning', 'Ventana bloqueada', 'Permita las ventanas emergentes para imprimir');
      else toast('success', 'Reporte enviado a impresión', 'Queda registrado en auditoría');
    } finally {
      setImprimiendo(false);
    }
  };

  return (
    <div className="space-y-6">
      {encabezado}

      {/* Selector de reporte */}
      <div className="flex flex-wrap gap-2">
        {reportes.map((r) => (
          <button
            key={r.id}
            onClick={() => setActivo(r.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              r.id === activo
                ? 'bg-[var(--primary-50)] border-[var(--primary-300)] text-[var(--primary-700)]'
                : 'bg-[var(--bg-card)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--primary-300)]'
            }`}
          >
            {r.titulo}
          </button>
        ))}
      </div>

      {/* Barra de filtro e impresión */}
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-primary)] p-6 mt-6 flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{def?.titulo}</h2>
          {def?.descripcion && <p className="text-sm text-[var(--text-secondary)]">{def.descripcion}</p>}
        </div>
        {conPeriodo && (
          <div className="flex flex-wrap items-end gap-3">
            <Input label="Desde" type="date" value={periodo.fechaInicio} onChange={(e) => setPeriodo((p) => ({ ...p, fechaInicio: e.target.value }))} />
            <Input label="Hasta" type="date" value={periodo.fechaFin} onChange={(e) => setPeriodo((p) => ({ ...p, fechaFin: e.target.value }))} />
            <Button variant="secondary" onClick={generar} loading={loading}>
              <RefreshCw className="w-4 h-4" />Generar
            </Button>
          </div>
        )}
        {!conPeriodo && (
          <Button variant="secondary" onClick={generar} loading={loading}><RefreshCw className="w-4 h-4" />Actualizar</Button>
        )}
        <Button onClick={imprimir} loading={imprimiendo} disabled={loading || secciones.length === 0}>
          <Printer className="w-4 h-4" />Imprimir
        </Button>
      </div>

      {/* Mostrar secciones sin Card wrapper - solo listas y tablas */}
      {loading && secciones.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-primary)] p-6 mt-6 space-y-4">
          <div className="h-6 shimmer rounded-lg w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((k) => <div key={k} className="h-20 shimmer rounded-lg" />)}
          </div>
          {[1, 2, 3, 4].map((r) => <div key={r} className="h-10 shimmer rounded-lg" />)}
        </div>
      ) : (
        secciones.map((s) => (
          <div key={s.titulo} className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-primary)] p-6 mt-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">{s.titulo}</h2>
            
            {s.resumen && s.resumen.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {s.resumen.map((k) => (
                  <div key={k.label} className="rounded border border-[var(--border-primary)] p-3">
                    <p className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{k.value}</p>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">{k.label}</p>
                  </div>
                ))}
              </div>
            )}
            
            {s.columnas && s.columnas.length > 0 && (
              <div className="overflow-x-auto mt-4">
                {(s.filas ?? []).length === 0 ? (
                  <p className="text-sm text-[var(--text-tertiary)] py-4 text-center">Sin registros en el período</p>
                ) : (
                  <table className="table-premium w-full text-sm">
                    <thead>
                      <tr>{s.columnas.map((c) => <th key={c.key} style={{ textAlign: c.align ?? 'left' }}>{c.header}</th>)}</tr>
                    </thead>
                    <tbody>
                      {(s.filas ?? []).slice(0, 300).map((f, i) => (
                        <tr key={i}>
                          {s.columnas!.map((c) => (
                            <td key={c.key} style={{ textAlign: c.align ?? 'left' }}>
                              {c.format ? c.format(f) : String(f[c.key] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {(s.filas ?? []).length > 300 && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-2">Mostrando 300 de {s.filas!.length} filas en pantalla. La impresión incluye todas.</p>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
