import { useEffect, useState } from 'react';
import { ClipboardCheck, Search, Printer } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, Input, Select, Button } from '../components/ui';
import DataTable from '../components/ui/DataTable';
import { toast } from '../components/ui/Toast';
import { errMsg } from '../api/errMsg';
import api from '../api/axios';
import { reportesService } from '../api/reportes.service';
import { objeto, hoyIso } from '../utils/api.utils';
import { fmtFecha, imprimirReporte, periodoTexto } from '../utils/impresion';

interface AuditEntry {
  id: string; userId: string; userEmail?: string; usuarioNombre?: string; usuarioRol?: string;
  action: string; entityType: string; entityId: string; newValue?: Record<string, unknown>; ipAddress?: string; createdAt: string;
}

const ACCION: Record<string, string> = { CREATE: 'Registró', UPDATE: 'Modificó', DELETE: 'Eliminó', LOGIN: 'Inició sesión', LOGOUT: 'Cerró sesión', LOGIN_FAILED: 'Intento de acceso fallido', EXPORT: 'Exportó', PRINT: 'Imprimió', PASSWORD_RESET_REQUEST: 'Solicitó restablecer contraseña', PASSWORD_RESET: 'Restableció contraseña' };
const MODULO: Record<string, string> = { paciente: 'Pacientes', cita: 'Citas', turno: 'Turnos', pago: 'Pagos', consulta: 'Consulta médica', receta: 'Recetas', triaje: 'Triaje', hospitalizacion: 'Hospitalización', evolucion: 'Evoluciones', reporte: 'Reportes', auth: 'Accesos', usuario: 'Usuarios', configuracion: 'Configuración', respaldo: 'Respaldos', medico: 'Médicos' };
const ROL: Record<string, string> = { admin: 'Administrador', gerente: 'Gerente', secretaria: 'Secretaria', recepcionista: 'Recepcionista', medico: 'Médico', enfermeria: 'Enfermería' };

const describir = (e: AuditEntry): string => {
  const accion = ACCION[e.action] ?? e.action;
  const modulo = (MODULO[e.entityType] ?? e.entityType ?? '').toLowerCase();
  if (e.action === 'PRINT') return `Imprimió ${e.newValue?.detalle ?? e.newValue?.reporte ?? 'reporte'}`;
  if (e.entityType === 'auth') return accion;
  if (e.action === 'CREATE') {
    const singular: Record<string, string> = { paciente: 'paciente', cita: 'cita', turno: 'turno', pago: 'pago', consulta: 'consulta', receta: 'receta', triaje: 'triaje', hospitalizacion: 'internación', evolucion: 'evolución', respaldo: 'respaldo', usuario: 'usuario', medico: 'médico' };
    return `Registró ${singular[e.entityType] ?? modulo}`;
  }
  return `${accion} ${modulo}`.trim();
};

const inicioMes = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; };

/** Administración/Gerencia → Auditoría: quién hizo qué, cuándo y en qué módulo. */
export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ entityType: '', userId: '', action: '', startDate: inicioMes(), endDate: hoyIso() });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 30;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (filters.entityType) params.entityType = filters.entityType;
      if (filters.userId) params.userId = filters.userId;
      if (filters.action) params.action = filters.action;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await api.get('/audit', { params });
      const data = res.data?.data || res.data || [];
      setLogs(data ?? []);
      const meta = (res as unknown as { meta?: { total?: number } }).meta ?? res.data?.meta;
      setTotal(meta?.total ?? (Array.isArray(data) ? data.length : 0));
    } catch (e) { toast('error', 'Error', errMsg(e, 'No se pudieron cargar los registros de auditoría')); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(loadLogs, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const imprimirReporteAuditoria = async (tipo: 'general' | 'usuario' | 'accesos') => {
    try {
      const r = objeto<{ total: number; porUsuario: { nombre: string; total: number }[]; porAccion: { nombre: string; total: number }[]; lista: Record<string, unknown>[] }>(
        await reportesService.auditoria({ fechaInicio: filters.startDate, fechaFin: filters.endDate }, tipo, tipo === 'usuario' ? filters.userId || undefined : undefined),
      );
      const titulo = tipo === 'general' ? 'Auditoría General' : tipo === 'usuario' ? 'Actividades por Usuario' : 'Accesos al Sistema';
      await imprimirReporte(titulo, periodoTexto(filters.startDate, filters.endDate), [
        { titulo: 'Resumen', resumen: [{ label: 'Registros', value: r.total }, ...r.porAccion.slice(0, 6).map((a) => ({ label: ACCION[a.nombre] ?? a.nombre, value: a.total }))] },
        ...(tipo !== 'accesos' ? [{ titulo: 'Actividad por usuario', columnas: [{ key: 'nombre', header: 'Usuario' }, { key: 'total', header: 'Acciones', align: 'right' as const }], filas: r.porUsuario as unknown as Record<string, unknown>[] }] : []),
        { titulo: 'Detalle', columnas: [
          { key: 'fecha', header: 'Fecha', format: (f) => fmtFecha(f.fecha as string, true) }, { key: 'usuario', header: 'Usuario' }, { key: 'rol', header: 'Rol', format: (f) => ROL[String(f.rol)] ?? String(f.rol ?? '') },
          { key: 'accion', header: 'Acción', format: (f) => ACCION[String(f.accion)] ?? String(f.accion) }, { key: 'modulo', header: 'Módulo', format: (f) => MODULO[String(f.modulo)] ?? String(f.modulo ?? '') }, { key: 'ip', header: 'IP' },
        ], filas: r.lista },
      ], { registrar: { reporte: `auditoria-${tipo}`, detalle: titulo } });
    } catch (e) { toast('error', 'No se pudo generar el reporte', errMsg(e)); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6 animate-in-up">
      <PageHeader icon={ClipboardCheck} title="Auditoría" subtitle="Registro inmutable: fecha, usuario, acción y módulo de cada operación" stats={[{ label: 'registros', value: total }]}
        action={<div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => imprimirReporteAuditoria('general')}><Printer className="w-4 h-4" />Auditoría general</Button>
          <Button size="sm" variant="secondary" onClick={() => imprimirReporteAuditoria('usuario')}><Printer className="w-4 h-4" />Actividades por usuario</Button>
          <Button size="sm" variant="secondary" onClick={() => imprimirReporteAuditoria('accesos')}><Printer className="w-4 h-4" />Accesos al sistema</Button>
        </div>} />

      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <Input label="Desde" type="date" value={filters.startDate} onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))} />
          <Input label="Hasta" type="date" value={filters.endDate} onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))} />
          <Select label="Módulo" value={filters.entityType} onChange={(e) => setFilters((p) => ({ ...p, entityType: e.target.value }))} options={[{ value: '', label: 'Todos' }, ...Object.entries(MODULO).map(([value, label]) => ({ value, label }))]} />
          <Select label="Acción" value={filters.action} onChange={(e) => setFilters((p) => ({ ...p, action: e.target.value }))} options={[{ value: '', label: 'Todas' }, ...Object.entries(ACCION).map(([value, label]) => ({ value, label }))]} />
          <Input label="ID de usuario" value={filters.userId} onChange={(e) => setFilters((p) => ({ ...p, userId: e.target.value }))} placeholder="Ej. 3" />
          <Button onClick={() => { setPage(1); loadLogs(); }}><Search className="w-4 h-4" />Filtrar</Button>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <DataTable
          columns={[
            { key: 'createdAt', header: 'Fecha', width: '170px', render: (e) => <span className="text-xs whitespace-nowrap tabular-nums">{fmtFecha(e.createdAt, true)}</span> },
            { key: 'usuario', header: 'Usuario', render: (e) => (<div><p className="text-sm font-medium text-[var(--text-primary)]">{e.usuarioNombre || e.userEmail || e.userId}</p><p className="text-xs text-[var(--text-tertiary)]">{ROL[e.usuarioRol ?? ''] ?? e.usuarioRol ?? ''}{e.userEmail && e.usuarioNombre ? ` · ${e.userEmail}` : ''}</p></div>) },
            { key: 'action', header: 'Acción', render: (e) => (
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                e.action === 'LOGIN' ? 'bg-[var(--success-100)] text-[var(--success-700)]' :
                e.action === 'LOGIN_FAILED' || e.action === 'DELETE' ? 'bg-[var(--danger-100)] text-[var(--danger-700)]' :
                e.action === 'PRINT' ? 'bg-violet-50 text-violet-700' :
                e.action === 'CREATE' ? 'bg-[var(--info-100)] text-[var(--info-500)]' :
                'bg-[var(--warning-100)] text-[var(--warning-700)]'}`}>{describir(e)}</span>
            ) },
            { key: 'entityType', header: 'Módulo', render: (e) => MODULO[e.entityType] ?? e.entityType },
            { key: 'entityId', header: 'Registro', width: '90px', render: (e) => <span className="text-xs font-mono">{e.entityId}</span> },
            { key: 'ipAddress', header: 'IP', width: '120px', render: (e) => <span className="text-xs">{e.ipAddress || '—'}</span> },
          ]}
          data={logs}
          keyExtractor={(e) => e.id}
          searchable={false}
          loading={loading}
          emptyMessage="No se encontraron registros. Ajuste los filtros de búsqueda."
          pageSize={limit}
          server={{ page, totalPages, totalItems: total, limit, onPageChange: setPage }}
        />
      </Card>
    </div>
  );
}
