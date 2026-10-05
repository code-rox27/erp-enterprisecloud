import { Link } from 'react-router-dom';
import { Badge, Button, Table, type BadgeVariant, type TableColumn } from '@/components/ui';
import { EstadoCuentaBadge } from '@/modules/finanzas';
import type {
  DevolucionCompra,
  EstadoDevolucion,
  EstadoSolicitud,
  FacturaCompra,
  OrdenCompra,
  RecepcionCompra,
  SolicitudCompra,
} from '@/types/compras';
import type { Cuenta, MedioPago } from '@/types/finanzas';
import type { Almacen, Producto } from '@/types/inventario';
import type { Proveedor } from '@/types/proveedor';
import { getEstadoCuenta } from '@/utils/finanzas';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PRIORIDAD } from './OrdenesTab';

const ESTADO_SOLICITUD: Record<EstadoSolicitud, { label: string; variant: BadgeVariant }> = {
  pendiente: { label: 'Pendiente', variant: 'warning' },
  aprobada: { label: 'Aprobada', variant: 'success' },
  rechazada: { label: 'Rechazada', variant: 'danger' },
};

const ESTADO_DEVOLUCION: Record<EstadoDevolucion, { label: string; variant: BadgeVariant }> = {
  solicitada: { label: 'Solicitada', variant: 'warning' },
  aprobada: { label: 'Aprobada', variant: 'info' },
  procesada: { label: 'Procesada', variant: 'success' },
};

// ───────── Solicitudes (solo lectura en esta entrega) ─────────
export function SolicitudesTab({
  solicitudes,
  proveedorPorId,
  isLoading,
}: {
  solicitudes: readonly SolicitudCompra[];
  proveedorPorId: Map<string, Proveedor>;
  isLoading: boolean;
}) {
  const columns: TableColumn<SolicitudCompra>[] = [
    {
      key: 'codigo',
      header: 'Solicitud',
      cell: (s) => (
        <div>
          <p className="font-medium text-foreground">{s.codigo}</p>
          <p className="text-xs text-muted-foreground">{formatDate(s.fecha)}</p>
        </div>
      ),
    },
    { key: 'descripcion', header: 'Descripción' },
    { key: 'proveedor', header: 'Proveedor', cell: (s) => proveedorPorId.get(s.proveedorId)?.razonSocial ?? s.proveedorId },
    { key: 'monto', header: 'Monto', align: 'right', cell: (s) => formatCurrency(s.monto) },
    { key: 'prioridad', header: 'Prioridad', cell: (s) => <Badge variant={PRIORIDAD[s.prioridad].variant}>{PRIORIDAD[s.prioridad].label}</Badge> },
    { key: 'estado', header: 'Estado', cell: (s) => <Badge variant={ESTADO_SOLICITUD[s.estado].variant} dot>{ESTADO_SOLICITUD[s.estado].label}</Badge> },
  ];
  return <Table<SolicitudCompra> columns={columns} data={solicitudes} rowKey={(s) => s.id} isLoading={isLoading} emptyMessage="No hay solicitudes registradas." />;
}

// ───────── Recepciones (historial) ─────────
export function RecepcionesTab({
  recepciones,
  ordenPorId,
  proveedorPorId,
  productoPorId,
  almacenPorId,
  isLoading,
}: {
  recepciones: readonly RecepcionCompra[];
  ordenPorId: Map<string, OrdenCompra>;
  proveedorPorId: Map<string, Proveedor>;
  productoPorId: Map<string, Producto>;
  almacenPorId: Map<string, Almacen>;
  isLoading: boolean;
}) {
  const columns: TableColumn<RecepcionCompra>[] = [
    {
      key: 'codigo',
      header: 'Recepción',
      cell: (r) => (
        <div>
          <p className="font-medium text-foreground">{r.codigo}</p>
          <p className="text-xs text-muted-foreground">{formatDate(r.fecha)}</p>
        </div>
      ),
    },
    { key: 'orden', header: 'Orden', cell: (r) => ordenPorId.get(r.ordenId)?.codigo ?? r.ordenId },
    {
      key: 'proveedor',
      header: 'Proveedor',
      cell: (r) => {
        const orden = ordenPorId.get(r.ordenId);
        return orden ? proveedorPorId.get(orden.proveedorId)?.razonSocial ?? orden.proveedorId : '—';
      },
    },
    { key: 'almacen', header: 'Almacén', cell: (r) => almacenPorId.get(r.almacenId)?.nombre ?? r.almacenId },
    {
      key: 'detalle',
      header: 'Recibido',
      cell: (r) => (
        <ul className="text-xs text-muted-foreground">
          {r.lineas.map((l) => (
            <li key={l.productoId}>
              {l.cantidad} × {productoPorId.get(l.productoId)?.nombre ?? l.productoId}
            </li>
          ))}
        </ul>
      ),
    },
  ];
  return <Table<RecepcionCompra> columns={columns} data={[...recepciones].reverse()} rowKey={(r) => r.id} isLoading={isLoading} emptyMessage="Aún no hay recepciones registradas." />;
}

// ───────── Facturas (el pago se registra con el diálogo de Finanzas) ─────────
export function FacturasTab({
  facturas,
  ordenPorId,
  proveedorPorId,
  cuentaPorId,
  isLoading,
  onPagar,
}: {
  facturas: readonly FacturaCompra[];
  ordenPorId: Map<string, OrdenCompra>;
  proveedorPorId: Map<string, Proveedor>;
  cuentaPorId: Map<string, Cuenta>;
  isLoading: boolean;
  onPagar: (cuentaId: string) => void;
}) {
  const columns: TableColumn<FacturaCompra>[] = [
    {
      key: 'codigo',
      header: 'Factura',
      cell: (f) => (
        <div>
          <p className="font-medium text-foreground">{f.codigo}</p>
          <p className="text-xs text-muted-foreground">{formatDate(f.fecha)}</p>
        </div>
      ),
    },
    { key: 'orden', header: 'Orden', cell: (f) => ordenPorId.get(f.ordenId)?.codigo ?? f.ordenId },
    { key: 'proveedor', header: 'Proveedor', cell: (f) => proveedorPorId.get(f.proveedorId)?.razonSocial ?? f.proveedorId },
    { key: 'vencimiento', header: 'Vence', cell: (f) => formatDate(f.vencimiento) },
    { key: 'monto', header: 'Monto', align: 'right', cell: (f) => formatCurrency(f.monto) },
    { key: 'saldo', header: 'Saldo', align: 'right', cell: (f) => formatCurrency(cuentaPorId.get(f.cuentaId)?.saldo ?? 0) },
    {
      key: 'estado',
      header: 'Estado',
      cell: (f) => {
        const cuenta = cuentaPorId.get(f.cuentaId);
        return cuenta ? <EstadoCuentaBadge estado={getEstadoCuenta(cuenta)} /> : '—';
      },
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (f) => {
        const cuenta = cuentaPorId.get(f.cuentaId);
        return (
          <Button size="sm" variant="outline" disabled={!cuenta || cuenta.saldo <= 0} onClick={() => onPagar(f.cuentaId)}>
            Registrar pago
          </Button>
        );
      },
    },
  ];
  return <Table<FacturaCompra> columns={columns} data={[...facturas].reverse()} rowKey={(f) => f.id} isLoading={isLoading} emptyMessage="No hay facturas registradas." />;
}

// ───────── Pagos (vista de lectura: el dueño es Finanzas) ─────────
interface FilaPago {
  id: string;
  fecha: string;
  proveedor: string;
  documento: string;
  monto: number;
  medio: MedioPago;
  referencia: string;
}

export function PagosTab({ cuentas, isLoading }: { cuentas: readonly Cuenta[]; isLoading: boolean }) {
  const filas: FilaPago[] = cuentas
    .flatMap((c) =>
      c.pagos.map((p) => ({
        id: p.id,
        fecha: p.fecha,
        proveedor: c.contraparte,
        documento: c.documento,
        monto: p.monto,
        medio: p.medio,
        referencia: p.referencia,
      })),
    )
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const columns: TableColumn<FilaPago>[] = [
    { key: 'fecha', header: 'Fecha', cell: (p) => formatDate(p.fecha) },
    { key: 'proveedor', header: 'Proveedor' },
    { key: 'documento', header: 'Factura' },
    { key: 'monto', header: 'Monto', align: 'right', cell: (p) => formatCurrency(p.monto) },
    { key: 'medio', header: 'Medio', cell: (p) => <span className="capitalize">{p.medio}</span> },
    { key: 'referencia', header: 'Referencia' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Los pagos a proveedores se gestionan en Finanzas.{' '}
        <Link to="/finanzas/cxp" className="font-medium text-primary hover:underline">
          Ir a Cuentas por pagar
        </Link>
      </p>
      <Table<FilaPago> columns={columns} data={filas} rowKey={(p) => p.id} isLoading={isLoading} emptyMessage="Aún no se registraron pagos." />
    </div>
  );
}

// ───────── Devoluciones (solo lectura en esta entrega) ─────────
export function DevolucionesTab({
  devoluciones,
  ordenPorId,
  proveedorPorId,
  productoPorId,
  isLoading,
}: {
  devoluciones: readonly DevolucionCompra[];
  ordenPorId: Map<string, OrdenCompra>;
  proveedorPorId: Map<string, Proveedor>;
  productoPorId: Map<string, Producto>;
  isLoading: boolean;
}) {
  const columns: TableColumn<DevolucionCompra>[] = [
    { key: 'codigo', header: 'Devolución' },
    { key: 'orden', header: 'Orden', cell: (d) => ordenPorId.get(d.ordenId)?.codigo ?? d.ordenId },
    { key: 'proveedor', header: 'Proveedor', cell: (d) => proveedorPorId.get(d.proveedorId)?.razonSocial ?? d.proveedorId },
    { key: 'producto', header: 'Producto', cell: (d) => productoPorId.get(d.productoId)?.nombre ?? d.productoId },
    { key: 'motivo', header: 'Motivo' },
    { key: 'monto', header: 'Monto', align: 'right', cell: (d) => formatCurrency(d.monto) },
    { key: 'estado', header: 'Estado', cell: (d) => <Badge variant={ESTADO_DEVOLUCION[d.estado].variant} dot>{ESTADO_DEVOLUCION[d.estado].label}</Badge> },
  ];
  return <Table<DevolucionCompra> columns={columns} data={devoluciones} rowKey={(d) => d.id} isLoading={isLoading} emptyMessage="No hay devoluciones registradas." />;
}