interface Item { nombre: string; total: number }
interface Props { items: Item[]; color?: string; vacio?: string; formato?: (n: number) => string }

/** Gráfico de barras horizontal sin dependencias, para estadísticas de gerencia. */
export default function BarrasSimple({ items, color = 'var(--primary-500)', vacio = 'Sin datos en el período', formato }: Props) {
  if (!items.length) return <p className="text-sm text-center py-6 text-[var(--text-tertiary)]">{vacio}</p>;
  const max = Math.max(...items.map((i) => i.total), 1);
  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i.nombre} className="grid grid-cols-[minmax(90px,1fr)_3fr_auto] items-center gap-3 text-sm">
          <span className="truncate text-[var(--text-secondary)]" title={i.nombre}>{i.nombre}</span>
          <div className="h-3 rounded-full bg-[var(--bg-tertiary)] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.max(2, (i.total / max) * 100)}%`, backgroundColor: color }} /></div>
          <span className="font-semibold tabular-nums text-[var(--text-primary)] min-w-[36px] text-right">{formato ? formato(i.total) : i.total}</span>
        </div>
      ))}
    </div>
  );
}
