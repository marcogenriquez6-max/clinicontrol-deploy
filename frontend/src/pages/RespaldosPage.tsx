import { useEffect, useState } from 'react';
import { DatabaseBackup, Download, Trash2, Plus, RefreshCw } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card, ConfirmDialog } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { errMsg } from '../api/errMsg';
import { respaldoService, type RespaldoInfo } from '../api/configuracion.service';
import { lista } from '../utils/api.utils';
import { fmtFecha } from '../utils/impresion';

const tam = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/** Administración → Respaldos: copias de seguridad de la base de datos (pg_dump). */
export default function RespaldosPage() {
  const [items, setItems] = useState<RespaldoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [creando, setCreando] = useState(false);
  const [aBorrar, setABorrar] = useState<RespaldoInfo | null>(null);

  const load = async () => {
    setLoading(true);
    try { setItems(lista<RespaldoInfo>(await respaldoService.listar())); }
    catch (e) { toast('error', 'No se pudieron listar los respaldos', errMsg(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []);

  const crear = async () => {
    setCreando(true);
    try {
      const r = await respaldoService.crear();
      const info = (r.data ?? r) as RespaldoInfo;
      toast('success', 'Respaldo generado', `${info.nombre} · ${tam(info.tamanoBytes)}`);
      load();
    } catch (e) { toast('error', 'No se pudo generar el respaldo', errMsg(e, 'Verifique que pg_dump esté disponible en el servidor')); }
    finally { setCreando(false); }
  };

  const descargar = async (r: RespaldoInfo) => {
    try {
      const res = await respaldoService.descargar(r.nombre);
      const blob = new Blob([res.data as BlobPart], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = r.nombre; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) { toast('error', 'No se pudo descargar', errMsg(e)); }
  };

  const eliminar = async () => {
    if (!aBorrar) return;
    try { await respaldoService.eliminar(aBorrar.nombre); toast('success', 'Respaldo eliminado'); setABorrar(null); load(); }
    catch (e) { toast('error', 'No se pudo eliminar', errMsg(e)); }
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={DatabaseBackup} title="Respaldos" subtitle="Copias completas de la base de datos. Restaurables con pg_restore."
        stats={[{ label: 'respaldos', value: items.length }]}
        action={<div className="flex gap-2"><Button variant="secondary" onClick={load} loading={loading}><RefreshCw className="w-4 h-4" /></Button><Button onClick={crear} loading={creando}><Plus className="w-4 h-4" />Generar respaldo ahora</Button></div>} />
      <Card className="!p-0 overflow-hidden">
        <table className="table-premium w-full text-sm">
          <thead><tr><th>Archivo</th><th>Fecha</th><th className="text-right">Tamaño</th><th className="text-right">Acciones</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-[var(--text-tertiary)]">{loading ? 'Cargando…' : 'Aún no hay respaldos. Genere el primero con el botón superior.'}</td></tr>}
            {items.map((r) => (
              <tr key={r.nombre}>
                <td className="font-mono text-xs">{r.nombre}</td>
                <td className="tabular-nums">{fmtFecha(r.creadoEn, true)}</td>
                <td className="text-right tabular-nums">{tam(r.tamanoBytes)}</td>
                <td className="text-right"><div className="inline-flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => descargar(r)}><Download className="w-4 h-4" />Descargar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setABorrar(r)} className="hover:text-[var(--danger-600)]"><Trash2 className="w-4 h-4" /></Button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Recomendación">
        <p className="text-sm text-[var(--text-secondary)]">Genere un respaldo al cierre de cada jornada y guarde una copia fuera del equipo servidor. Cada respaldo y eliminación quedan registrados en Auditoría.</p>
      </Card>
      <ConfirmDialog isOpen={!!aBorrar} onClose={() => setABorrar(null)} title="Eliminar respaldo" message={`Se eliminará definitivamente ${aBorrar?.nombre ?? ''}.`} confirmText="Eliminar" cancelText="Cancelar" variant="danger" onConfirm={eliminar} />
    </div>
  );
}
