import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { Button, Input, Select, Table } from '@/components/ui';

const panelStyle: CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 18,
  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
};

const currency = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
});

type TabName = 'solicitudes' | 'ordenes' | 'recepcion' | 'facturas' | 'pagos' | 'devoluciones';
type OrderStatus = 'Borrador' | 'Pendiente' | 'Aprobada' | 'En tránsito' | 'Recibida' | 'Cancelada';
type ApprovalState = 'Pendiente' | 'Aprobada' | 'Rechazada';

type PurchaseOrder = {
  id: string;
  proveedor: string;
  fecha: string;
  producto: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
  estado: OrderStatus;
  aprobacion: ApprovalState;
  prioridad: 'Baja' | 'Media' | 'Alta';
};

type PurchaseRequest = {
  id: string;
  descripcion: string;
  proveedor: string;
  fecha: string;
  monto: number;
  prioridad: 'Baja' | 'Media' | 'Alta';
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
};

type ReceptionItem = {
  id: string;
  ordenId: string;
  proveedor: string;
  producto: string;
  cantidadSolicitada: number;
  cantidadRecibida: number;
  estado: 'Pendiente' | 'Parcial' | 'Completada';
  fecha: string;
};

type Invoice = {
  id: string;
  ordenId: string;
  proveedor: string;
  monto: number;
  estado: 'Pendiente' | 'Pagada' | 'Vencida';
  fecha: string;
};

type Payment = {
  id: string;
  proveedor: string;
  monto: number;
  metodo: 'Transferencia' | 'Cheque' | 'Efectivo';
  fecha: string;
  estado: 'Programado' | 'Ejecutado';
};

type ReturnItem = {
  id: string;
  ordenId: string;
  proveedor: string;
  producto: string;
  motivo: string;
  monto: number;
  estado: 'Solicitada' | 'Aprobada' | 'Procesada';
};

const initialOrders: PurchaseOrder[] = [
  {
    id: 'OC-2026-001',
    proveedor: 'Distribuidora Andina S.A.C.',
    fecha: '2026-10-01',
    producto: 'Malla de acero 10mm',
    cantidad: 125,
    costoUnitario: 18.2,
    subtotal: 2275,
    estado: 'Aprobada',
    aprobacion: 'Aprobada',
    prioridad: 'Alta',
  },
  {
    id: 'OC-2026-002',
    proveedor: 'Insumos Industriales del Perú',
    fecha: '2026-10-02',
    producto: 'Cemento tipo I',
    cantidad: 300,
    costoUnitario: 31.5,
    subtotal: 9450,
    estado: 'En tránsito',
    aprobacion: 'Aprobada',
    prioridad: 'Media',
  },
  {
    id: 'OC-2026-003',
    proveedor: 'TecnoSoluciones Lima',
    fecha: '2026-10-02',
    producto: 'Suministro de periféricos',
    cantidad: 18,
    costoUnitario: 620,
    subtotal: 11160,
    estado: 'Pendiente',
    aprobacion: 'Pendiente',
    prioridad: 'Baja',
  },
];

const initialRequests: PurchaseRequest[] = [
  {
    id: 'SC-1001',
    descripcion: 'Compra de materiales para obra A',
    proveedor: 'Distribuidora Andina S.A.C.',
    fecha: '2026-10-02',
    monto: 2275,
    prioridad: 'Alta',
    estado: 'Aprobada',
  },
  {
    id: 'SC-1002',
    descripcion: 'Repuestos de línea de montaje',
    proveedor: 'Insumos Industriales del Perú',
    fecha: '2026-10-02',
    monto: 8400,
    prioridad: 'Media',
    estado: 'Pendiente',
  },
  {
    id: 'SC-1003',
    descripcion: 'Equipo de oficina para área de logística',
    proveedor: 'TecnoSoluciones Lima',
    fecha: '2026-10-01',
    monto: 5450,
    prioridad: 'Baja',
    estado: 'Rechazada',
  },
];

const initialRecepciones: ReceptionItem[] = [
  {
    id: 'RC-7001',
    ordenId: 'OC-2026-001',
    proveedor: 'Distribuidora Andina S.A.C.',
    producto: 'Malla de acero 10mm',
    cantidadSolicitada: 125,
    cantidadRecibida: 112,
    estado: 'Parcial',
    fecha: '2026-10-03',
  },
  {
    id: 'RC-7002',
    ordenId: 'OC-2026-002',
    proveedor: 'Insumos Industriales del Perú',
    producto: 'Cemento tipo I',
    cantidadSolicitada: 300,
    cantidadRecibida: 300,
    estado: 'Completada',
    fecha: '2026-10-03',
  },
];

const initialInvoices: Invoice[] = [
  {
    id: 'FT-4001',
    ordenId: 'OC-2026-001',
    proveedor: 'Distribuidora Andina S.A.C.',
    monto: 2275,
    estado: 'Pagada',
    fecha: '2026-10-03',
  },
  {
    id: 'FT-4002',
    ordenId: 'OC-2026-002',
    proveedor: 'Insumos Industriales del Perú',
    monto: 9450,
    estado: 'Pendiente',
    fecha: '2026-10-04',
  },
];

const initialPayments: Payment[] = [
  {
    id: 'PG-5001',
    proveedor: 'Distribuidora Andina S.A.C.',
    monto: 2275,
    metodo: 'Transferencia',
    fecha: '2026-10-03',
    estado: 'Ejecutado',
  },
  {
    id: 'PG-5002',
    proveedor: 'Insumos Industriales del Perú',
    monto: 4750,
    metodo: 'Cheque',
    fecha: '2026-10-10',
    estado: 'Programado',
  },
];

const initialReturns: ReturnItem[] = [
  {
    id: 'DV-8001',
    ordenId: 'OC-2026-001',
    proveedor: 'Distribuidora Andina S.A.C.',
    producto: 'Malla de acero 10mm',
    motivo: 'Material con daño de empaque',
    monto: 340,
    estado: 'Solicitada',
  },
  {
    id: 'DV-8002',
    ordenId: 'OC-2026-002',
    proveedor: 'Insumos Industriales del Perú',
    producto: 'Cemento tipo I',
    motivo: 'Entrega incompleta',
    monto: 760,
    estado: 'Procesada',
  },
];

const tabs: Array<{ value: TabName; label: string }> = [
  { value: 'solicitudes', label: 'Solicitudes' },
  { value: 'ordenes', label: 'Órdenes' },
  { value: 'recepcion', label: 'Recepción' },
  { value: 'facturas', label: 'Facturas' },
  { value: 'pagos', label: 'Pagos' },
  { value: 'devoluciones', label: 'Devoluciones' },
];

const estadoOptions = ['todos', 'Borrador', 'Pendiente', 'Aprobada', 'En tránsito', 'Recibida', 'Cancelada'] as const;

export function ComprasPage() {
  const [activeTab, setActiveTab] = useState<TabName>('ordenes');
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<(typeof estadoOptions)[number]>('todos');
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders);
  const [form, setForm] = useState({
    proveedor: 'Distribuidora Andina S.A.C.',
    producto: 'Pintura epoxy',
    cantidad: '24',
    costoUnitario: '48.5',
    prioridad: 'Media' as 'Baja' | 'Media' | 'Alta',
  });

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesEstado = estadoFilter === 'todos' || order.estado === estadoFilter;
      const matchesText =
        q.length === 0 ||
        order.id.toLowerCase().includes(q) ||
        order.proveedor.toLowerCase().includes(q) ||
        order.producto.toLowerCase().includes(q);
      return matchesEstado && matchesText;
    });
  }, [orders, search, estadoFilter]);

  const totalPendientes = orders.filter((o) => o.estado === 'Pendiente' || o.estado === 'Borrador').length;
  const totalAprobadas = orders.filter((o) => o.aprobacion === 'Aprobada').length;
  const totalEnTransito = orders.filter((o) => o.estado === 'En tránsito').length;
  const totalImporte = orders.reduce((sum, o) => sum + o.subtotal, 0);

  const createOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cantidad = Number(form.cantidad);
    const costo = Number(form.costoUnitario);
    if (!form.proveedor || !form.producto || !Number.isFinite(cantidad) || cantidad <= 0 || !Number.isFinite(costo) || costo <= 0) {
      return;
    }

    const subtotal = cantidad * costo;
    const nuevo: PurchaseOrder = {
      id: `OC-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      proveedor: form.proveedor,
      fecha: new Date().toISOString().slice(0, 10),
      producto: form.producto,
      cantidad,
      costoUnitario: costo,
      subtotal,
      estado: 'Pendiente',
      aprobacion: 'Pendiente',
      prioridad: form.prioridad,
    };

    setOrders((prev) => [nuevo, ...prev]);
    setForm({
      proveedor: 'Distribuidora Andina S.A.C.',
      producto: '',
      cantidad: '1',
      costoUnitario: '0',
      prioridad: 'Media',
    });
    setActiveTab('ordenes');
  };

  const renderStatus = (status: string, tone: 'success' | 'warning' | 'neutral' | 'info' | 'danger' = 'neutral') => {
    const colors = {
      success: { bg: '#ECFDF5', color: '#047857' },
      warning: { bg: '#FFFBEB', color: '#B45309' },
      neutral: { bg: '#F8FAFC', color: '#475569' },
      info: { bg: '#EFF6FF', color: '#1D4ED8' },
      danger: { bg: '#FEF2F2', color: '#B91C1C' },
    } as const;

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: 999,
          padding: '6px 10px',
          fontSize: 12,
          fontWeight: 700,
          background: colors[tone].bg,
          color: colors[tone].color,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header style={{ ...panelStyle, padding: '22px 24px', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Compras</p>
          <h1 style={{ margin: '8px 0 0', fontSize: '2rem', color: '#020817' }}>Gestión de compras</h1>
        </div>
        <Button variant="primary" onClick={() => setActiveTab('ordenes')}>Nueva orden</Button>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div style={{ ...panelStyle, padding: '18px 20px' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Solicitudes</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{initialRequests.length}</h2>
        </div>
        <div style={{ ...panelStyle, padding: '18px 20px' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Órdenes pendientes</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{totalPendientes}</h2>
        </div>
        <div style={{ ...panelStyle, padding: '18px 20px' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Aprobadas</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{totalAprobadas}</h2>
        </div>
        <div style={{ ...panelStyle, padding: '18px 20px' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>En tránsito</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{totalEnTransito}</h2>
        </div>
        <div style={{ ...panelStyle, padding: '18px 20px' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Monto total</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '1.8rem' }}>{currency.format(totalImporte)}</h2>
        </div>
      </section>

      <section style={{ ...panelStyle, padding: '18px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '9px 12px',
                cursor: 'pointer',
                background: activeTab === tab.value ? '#2563EB' : '#F1F5F9',
                color: activeTab === tab.value ? '#FFFFFF' : '#020817',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(220px, 0.8fr)', gap: 12, alignItems: 'end' }}>
          <Input
            label="Buscar"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="OC, proveedor o producto"
          />
          <Select
            label="Estado"
            value={estadoFilter}
            onChange={(event) => setEstadoFilter(event.target.value as (typeof estadoOptions)[number])}
            options={estadoOptions.map((value) => ({ value, label: value === 'todos' ? 'Todos' : value }))}
          />
        </div>
      </section>

      {activeTab === 'solicitudes' && (
        <section style={{ ...panelStyle, padding: 20 }}>
          <Table
            columns={[
              { key: 'id', header: 'Solicitud' },
              { key: 'descripcion', header: 'Descripción' },
              { key: 'proveedor', header: 'Proveedor' },
              { key: 'monto', header: 'Monto', cell: (row: PurchaseRequest) => currency.format(row.monto) },
              { key: 'prioridad', header: 'Prioridad', cell: (row: PurchaseRequest) => renderStatus(row.prioridad, row.prioridad === 'Alta' ? 'warning' : row.prioridad === 'Media' ? 'info' : 'neutral') },
              { key: 'estado', header: 'Estado', cell: (row: PurchaseRequest) => renderStatus(row.estado, row.estado === 'Aprobada' ? 'success' : row.estado === 'Pendiente' ? 'warning' : 'danger') },
            ]}
            data={initialRequests}
            rowKey={(row) => row.id}
            emptyMessage="No hay solicitudes registradas."
          />
        </section>
      )}

      {activeTab === 'ordenes' && (
        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.75fr)', gap: 20 }}>
          <form onSubmit={createOrder} style={{ ...panelStyle, padding: 20, display: 'grid', gap: 16 }}>
            <div>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Nueva orden</p>
              <h3 style={{ margin: '8px 0 0', fontSize: '1.3rem', color: '#020817' }}>Crear orden de compra</h3>
            </div>

            <Input
              label="Proveedor"
              value={form.proveedor}
              onChange={(event) => setForm((prev) => ({ ...prev, proveedor: event.target.value }))}
            />
            <Input
              label="Producto"
              value={form.producto}
              onChange={(event) => setForm((prev) => ({ ...prev, producto: event.target.value }))}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Cantidad"
                type="number"
                min={1}
                value={form.cantidad}
                onChange={(event) => setForm((prev) => ({ ...prev, cantidad: event.target.value }))}
              />
              <Input
                label="Costo unitario"
                type="number"
                min={0}
                step="0.01"
                value={form.costoUnitario}
                onChange={(event) => setForm((prev) => ({ ...prev, costoUnitario: event.target.value }))}
              />
            </div>
            <Select
              label="Prioridad"
              value={form.prioridad}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, prioridad: event.target.value as 'Baja' | 'Media' | 'Alta' }))
              }
              options={[
                { value: 'Baja', label: 'Baja' },
                { value: 'Media', label: 'Media' },
                { value: 'Alta', label: 'Alta' },
              ]}
            />

            <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 12, background: '#F8FAFC' }}>
              <p style={{ margin: 0, color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Resumen</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ color: '#475569' }}>Subtotal</span>
                <strong>{currency.format((Number(form.cantidad) || 0) * (Number(form.costoUnitario) || 0))}</strong>
              </div>
            </div>

            <Button type="submit" variant="primary">Registrar orden</Button>
          </form>

          <div style={{ ...panelStyle, padding: '20px 0' }}>
            <Table
              columns={[
                { key: 'id', header: 'Orden' },
                { key: 'proveedor', header: 'Proveedor' },
                { key: 'producto', header: 'Producto' },
                { key: 'subtotal', header: 'Monto', cell: (row: PurchaseOrder) => currency.format(row.subtotal) },
                { key: 'estado', header: 'Estado', cell: (row: PurchaseOrder) => {
                  const tone = row.estado === 'Aprobada' ? 'success' : row.estado === 'Pendiente' ? 'warning' : row.estado === 'En tránsito' ? 'info' : row.estado === 'Recibida' ? 'success' : 'neutral';
                  return renderStatus(row.estado, tone);
                } },
                { key: 'aprobacion', header: 'Aprobación', cell: (row: PurchaseOrder) => renderStatus(row.aprobacion, row.aprobacion === 'Aprobada' ? 'success' : row.aprobacion === 'Pendiente' ? 'warning' : 'danger') },
              ]}
              data={filteredOrders}
              rowKey={(row) => row.id}
              emptyMessage="No hay órdenes con ese filtro."
            />
          </div>
        </section>
      )}

      {activeTab === 'recepcion' && (
        <section style={{ ...panelStyle, padding: 20 }}>
          <Table
            columns={[
              { key: 'ordenId', header: 'Orden' },
              { key: 'proveedor', header: 'Proveedor' },
              { key: 'producto', header: 'Producto' },
              { key: 'cantidadSolicitada', header: 'Solicitada' },
              { key: 'cantidadRecibida', header: 'Recibida' },
              { key: 'estado', header: 'Estado', cell: (row: ReceptionItem) => renderStatus(row.estado, row.estado === 'Completada' ? 'success' : row.estado === 'Parcial' ? 'warning' : 'neutral') },
              { key: 'fecha', header: 'Fecha', cell: (row: ReceptionItem) => new Date(row.fecha).toLocaleDateString('es-PE') },
            ]}
            data={initialRecepciones}
            rowKey={(row) => row.id}
            emptyMessage="No hay recepciones pendientes."
          />
        </section>
      )}

      {activeTab === 'facturas' && (
        <section style={{ ...panelStyle, padding: 20 }}>
          <Table
            columns={[
              { key: 'id', header: 'Factura' },
              { key: 'ordenId', header: 'Orden' },
              { key: 'proveedor', header: 'Proveedor' },
              { key: 'monto', header: 'Monto', cell: (row: Invoice) => currency.format(row.monto) },
              { key: 'estado', header: 'Estado', cell: (row: Invoice) => renderStatus(row.estado, row.estado === 'Pagada' ? 'success' : row.estado === 'Pendiente' ? 'warning' : 'danger') },
              { key: 'fecha', header: 'Fecha', cell: (row: Invoice) => new Date(row.fecha).toLocaleDateString('es-PE') },
            ]}
            data={initialInvoices}
            rowKey={(row) => row.id}
            emptyMessage="No hay facturas registradas."
          />
        </section>
      )}

      {activeTab === 'pagos' && (
        <section style={{ ...panelStyle, padding: 20 }}>
          <Table
            columns={[
              { key: 'id', header: 'Pago' },
              { key: 'proveedor', header: 'Proveedor' },
              { key: 'monto', header: 'Monto', cell: (row: Payment) => currency.format(row.monto) },
              { key: 'metodo', header: 'Método' },
              { key: 'estado', header: 'Estado', cell: (row: Payment) => renderStatus(row.estado, row.estado === 'Ejecutado' ? 'success' : 'info') },
              { key: 'fecha', header: 'Fecha', cell: (row: Payment) => new Date(row.fecha).toLocaleDateString('es-PE') },
            ]}
            data={initialPayments}
            rowKey={(row) => row.id}
            emptyMessage="No hay pagos programados."
          />
        </section>
      )}

      {activeTab === 'devoluciones' && (
        <section style={{ ...panelStyle, padding: 20 }}>
          <Table
            columns={[
              { key: 'id', header: 'Devolución' },
              { key: 'ordenId', header: 'Orden' },
              { key: 'proveedor', header: 'Proveedor' },
              { key: 'producto', header: 'Producto' },
              { key: 'motivo', header: 'Motivo' },
              { key: 'monto', header: 'Monto', cell: (row: ReturnItem) => currency.format(row.monto) },
              { key: 'estado', header: 'Estado', cell: (row: ReturnItem) => renderStatus(row.estado, row.estado === 'Procesada' ? 'success' : row.estado === 'Aprobada' ? 'info' : 'warning') },
            ]}
            data={initialReturns}
            rowKey={(row) => row.id}
            emptyMessage="No hay devoluciones registradas."
          />
        </section>
      )}
    </div>
  );
}
