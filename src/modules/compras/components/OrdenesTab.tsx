import { useMemo, useState } from 'react';
import { Badge, Button, Input, Select, Table, type BadgeVariant, type TableColumn } from '@/components/ui';
import type { EstadoOrden, FacturaCompra, OrdenCompra, Prioridad } from '@/types/compras';
import type { Producto } from '@/types/inventario';
import type { Proveedor } from '@/types/proveedor';
import { esRecibible, totalOrden } from '@/utils/compras';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const ESTADO_ORDEN: Record<EstadoOrden, { label: string; variant: BadgeVariant }> = {
  pendiente: { label: 'Pendiente de aprobación', variant: 'warning' },
  aprobada: { label: 'Aprobada', variant: 'info' },
  recibida_parcial: { label: 'Recibida parcial', variant: 'warning' },
  recibida: { label: 'Recibida', variant: 'success' },
  rechazada: { label: 'Rechazada', variant: 'danger' },
  cancelada: { label: 'Cancelada', variant: 'neutral' },
};

export const PRIORIDAD: Record<Prioridad, { label: string; variant: BadgeVariant }> = {
  alta: { label: 'Alta', variant: 'warning' },
  media: { label: 'Media', variant: 'info' },
  baja: { label: 'Baja', variant: 'neutral' },
};

const ESTADO_OPTIONS = (Object.keys(ESTADO_ORDEN) as EstadoOrden[]).map((e) => ({
  value: e,
  label: ESTADO_ORDEN[e].label,
}));

interface Props {
  ordenes: readonly OrdenCompra[];
  proveedorPorId: Map<string, Proveedor>;
  productoPorId: Map<string, Producto>;
  facturaPorOrden: Map<string, FacturaCompra>;
  isLoading: boolean;
  onAprobar: (id: string) => Promise<void>;
  onRechazar: (id: string) => Promise<void>;
  onCancelar: (id: string) => Promise<void>;
  onRecibir: (orden: OrdenCompra) => void;
  onFacturar: (orden: OrdenCompra) => void;
}

export function OrdenesTab({
  ordenes,
  proveedorPorId,
  productoPorId,
  facturaPorOrden,
  isLoading,
  onAprobar,
  onRechazar,
  onCancelar,
  onRecibir,
  onFacturar,
}: Props) {
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ordenes.filter((o) => {
      if (estado !== '' && o.estado !== estado) return false;
      if (q === '') return true;
      const proveedor = proveedorPorId.get(o.proveedorId)?.razonSocial.toLowerCase() ?? '';
      const productos = o.lineas.map((l) => productoPorId.get(l.productoId)?.nombre.toLowerCase() ?? '').join(' ');
      return o.codigo.toLowerCase().includes(q) || proveedor.includes(q) || productos.includes(q);
    });
  }, [ordenes, search, estado, proveedorPorId, productoPorId]);

  const run = async (id: string, action: (id: string) => Promise<void>) => {
    setBusyId(id);
    setError(null);
    try {
      await action(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar la acción');
    } finally {
      setBusyId(null);
    }
  };

  const columns: TableColumn<OrdenCompra>[] = [
    {
      key: 'codigo',
      header: 'Orden',
      cell: (o) => (
        <div>
          <p className="font-medium text-foreground">{o.codigo}</p>
          <p className="text-xs text-muted-foreground">{formatDate(o.fecha)}</p>
        </div>
      ),
    },
    { key: 'proveedor', header: 'Proveedor', cell: (o) => proveedorPorId.get(o.proveedorId)?.razonSocial ?? o.proveedorId },
    {
      key: 'productos',
      header: 'Productos',
      cell: (o) => {
        const primero = o.lineas[0];
        const nombre = primero ? productoPorId.get(primero.productoId)?.nombre ?? primero.productoId : '—';
        return (
          <div>
            <p>{nombre}</p>
            {o.lineas.length > 1 && (
              <p className="text-xs text-muted-foreground">+ {o.lineas.length - 1} más</p>
            )}
          </div>
        );
      },
    },
    { key: 'prioridad', header: 'Prioridad', cell: (o) => <Badge variant={PRIORIDAD[o.prioridad].variant}>{PRIORIDAD[o.prioridad].label}</Badge> },
    { key: 'total', header: 'Total', align: 'right', cell: (o) => formatCurrency(totalOrden(o)) },
    { key: 'estado', header: 'Estado', cell: (o) => <Badge variant={ESTADO_ORDEN[o.estado].variant} dot>{ESTADO_ORDEN[o.estado].label}</Badge> },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (o) => {
        const busy = busyId === o.id;
        return (
          <div className="flex justify-end gap-1">
            {o.estado === 'pendiente' && (
              <>
                <Button size="sm" variant="outline" isLoading={busy} onClick={() => void run(o.id, onAprobar)}>Aprobar</Button>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => void run(o.id, onRechazar)}>Rechazar</Button>
              </>
            )}
            {esRecibible(o.estado) && (
              <Button size="sm" variant="outline" onClick={() => onRecibir(o)}>Recibir</Button>
            )}
            {o.estado === 'aprobada' && (
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => void run(o.id, onCancelar)}>Cancelar</Button>
            )}
            {o.estado === 'recibida' && !facturaPorOrden.has(o.id) && (
              <Button size="sm" variant="outline" onClick={() => onFacturar(o)}>Facturar</Button>
            )}
            {o.estado === 'recibida' && facturaPorOrden.has(o.id) && (
              <span className="px-2 text-xs text-muted-foreground">Facturada</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_240px]">
        <Input aria-label="Buscar orden" placeholder="Buscar por orden, proveedor o producto…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select aria-label="Filtrar por estado" placeholder="Todos los estados" options={ESTADO_OPTIONS} value={estado} onChange={(e) => setEstado(e.target.value)} />
      </div>
      {error && <p role="alert" className="rounded-md border border-destructive px-3 py-2 text-sm text-destructive">{error}</p>}
      <Table<OrdenCompra> columns={columns} data={filtradas} rowKey={(o) => o.id} isLoading={isLoading} emptyMessage="No hay órdenes con ese filtro." />
    </div>
  );
}