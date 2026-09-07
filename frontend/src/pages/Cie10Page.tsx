import { useEffect, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, Input } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { errMsg } from '../api/errMsg';
import { diagnosticoService } from '../api/diagnostico.service';
import { lista } from '../utils/api.utils';

interface Cie10 { id: number; codigo: string; descripcion: string; capitulo?: string; categoria?: string }

/** Médico → CIE-10: catálogo de diagnósticos para consulta rápida. */
export default function Cie10Page() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Cie10[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.trim().length < 2) { setItems([]); return; }
      setLoading(true);
      try { setItems(lista<Cie10>(await diagnosticoService.searchCie10(q.trim()))); }
      catch (e) { toast('error', 'No se pudo buscar en el catálogo', errMsg(e)); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-6">
      <PageHeader icon={BookOpen} title="Catálogo CIE-10" subtitle="Clasificación Internacional de Enfermedades. Busque por código (J00) o por descripción (resfriado)." />
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Escriba al menos 2 caracteres: código o descripción" className="pl-9" autoFocus />
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">El diagnóstico se registra dentro de la consulta SOAP; aquí solo se consulta el catálogo.</p>
      </Card>
      <Card className="!p-0 overflow-hidden">
        <table className="table-premium w-full text-sm">
          <thead><tr><th style={{ width: 120 }}>Código</th><th>Descripción</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={2} className="text-center py-8 text-[var(--text-tertiary)]">Buscando…</td></tr>}
            {!loading && q.trim().length >= 2 && items.length === 0 && <tr><td colSpan={2} className="text-center py-8 text-[var(--text-tertiary)]">Sin coincidencias para "{q}"</td></tr>}
            {!loading && q.trim().length < 2 && <tr><td colSpan={2} className="text-center py-8 text-[var(--text-tertiary)]">Ingrese un término de búsqueda</td></tr>}
            {items.map((c) => (
              <tr key={c.id ?? c.codigo}><td className="font-bold tabular-nums text-[var(--primary-700)]">{c.codigo}</td><td>{c.descripcion}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
