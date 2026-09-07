import { useEffect, useState } from 'react';
import { KeyRound, Printer } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button, Card } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { errMsg } from '../api/errMsg';
import { permisosService, type PermisoRol } from '../api/configuracion.service';
import { lista } from '../utils/api.utils';
import { imprimirReporte } from '../utils/impresion';

const NOMBRE_ROL: Record<string, string> = { admin: 'Administrador', gerente: 'Gerente', secretaria: 'Secretaria', recepcionista: 'Recepcionista', medico: 'Médico', enfermeria: 'Enfermería' };

/** Administración → Permisos: matriz rol × módulos y permisos del sistema (solo lectura). */
export default function PermisosPage() {
  const [roles, setRoles] = useState<PermisoRol[]>([]);
  useEffect(() => {
    permisosService.getMatriz().then((r) => setRoles(lista<PermisoRol>(r))).catch((e) => toast('error', 'No se pudo cargar la matriz', errMsg(e)));
  }, []);
  const modulos = Array.from(new Set(roles.flatMap((r) => r.modulos)));

  const imprimir = () => imprimirReporte('Matriz de permisos por rol', 'Control de acceso basado en roles (RBAC)', [
    { titulo: 'Módulos por rol', columnas: [{ key: 'rol', header: 'Rol', format: (f) => NOMBRE_ROL[String(f.rol)] ?? String(f.rol) }, { key: 'descripcion', header: 'Responsabilidad' }, { key: 'modulos', header: 'Módulos', format: (f) => (f.modulos as string[]).join(', ') }], filas: roles as unknown as Record<string, unknown>[] },
    { titulo: 'Permisos técnicos', columnas: [{ key: 'rol', header: 'Rol', format: (f) => NOMBRE_ROL[String(f.rol)] ?? String(f.rol) }, { key: 'permisos', header: 'Permisos', format: (f) => (f.permisos as string[]).join(', ') }], filas: roles as unknown as Record<string, unknown>[] },
  ], { registrar: { reporte: 'permisos', detalle: 'Matriz RBAC' } });

  return (
    <div className="space-y-6">
      <PageHeader icon={KeyRound} title="Permisos" subtitle="Qué módulos ve y qué operaciones puede ejecutar cada rol. El backend aplica estas reglas en cada petición."
        action={<Button variant="secondary" onClick={imprimir} disabled={!roles.length}><Printer className="w-4 h-4" />Imprimir</Button>} />
      <Card title="Matriz rol × módulo" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium w-full text-sm">
            <thead><tr><th>Módulo</th>{roles.map((r) => <th key={r.rol} className="text-center">{NOMBRE_ROL[r.rol] ?? r.rol}</th>)}</tr></thead>
            <tbody>
              {modulos.map((m) => (
                <tr key={m}><td className="font-medium text-[var(--text-primary)]">{m}</td>{roles.map((r) => <td key={r.rol} className="text-center">{r.modulos.includes(m) ? <span className="inline-block w-5 h-5 rounded-full bg-[var(--success-100)] text-[var(--success-700)] text-xs leading-5 font-bold">✓</span> : <span className="text-[var(--text-tertiary)]">—</span>}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((r) => (
          <Card key={r.rol} title={NOMBRE_ROL[r.rol] ?? r.rol} subtitle={r.descripcion}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)] mb-2">Permisos</p>
            <div className="flex flex-wrap gap-1.5">
              {r.permisos.map((p) => <span key={p} className="px-2 py-0.5 rounded-md text-xs font-mono bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">{p}</span>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
