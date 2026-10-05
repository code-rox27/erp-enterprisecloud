import { useMemo, useState, type CSSProperties } from 'react';
import { Button, Input, Select, Table } from '@/components/ui';

type Producto = {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  unidad: 'UND' | 'KG' | 'LT' | 'CJA';
  stock: number;
  stockMinimo: number;
  precioCompra: number;
  precioVenta: number;
  estado: 'activo' | 'inactivo';
};

type Almacen = {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  responsable: string;
  estado: 'activo' | 'inactivo';
};

type KardexItem = {
  id: string;
  producto: string;
  almacen: string;
  tipo: 'Entrada' | 'Salida' | 'Ajuste' | 'Transferencia';
  cantidad: number;
  saldo: number;
  fecha: string;
  referencia: string;
};

type Transferencia = {
  id: string;
  origen: string;
  destino: string;
  producto: string;
  cantidad: number;
  fecha: string;
  estado: 'Programada' | 'En tránsito' | 'Completada';
};

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

const productos: Producto[] = [
  { id: 'prod-001', sku: 'MAT-001', nombre: 'Cemento Tipo I', categoria: 'Materiales', unidad: 'CJA', stock: 320, stockMinimo: 120, precioCompra: 31.5, precioVenta: 42.2, estado: 'activo' },
  { id: 'prod-002', sku: 'MAT-002', nombre: 'Malla de acero 10mm', categoria: 'Metales', unidad: 'UND', stock: 154, stockMinimo: 80, precioCompra: 18.2, precioVenta: 23.9, estado: 'activo' },
  { id: 'prod-003', sku: 'ELE-010', nombre: 'Cable eléctrico 3x2.5', categoria: 'Eléctricos', unidad: 'KG', stock: 42, stockMinimo: 50, precioCompra: 14.8, precioVenta: 18.6, estado: 'activo' },
  { id: 'prod-004', sku: 'OFI-101', nombre: 'Estación de trabajo', categoria: 'Oficina', unidad: 'UND', stock: 18, stockMinimo: 6, precioCompra: 980, precioVenta: 1240, estado: 'inactivo' },
];

const almacenes: Almacen[] = [
  { id: 'alm-001', codigo: 'ALM-CENTRAL', nombre: 'Almacén Central', direccion: 'Av. Argentina 1850, Callao', responsable: 'Alan Pérez', estado: 'activo' },
  { id: 'alm-002', codigo: 'ALM-NORTE', nombre: 'Almacén Norte', direccion: 'Av. Túpac Amaru 3200, Independencia', responsable: 'Rosa Medina', estado: 'activo' },
  { id: 'alm-003', codigo: 'ALM-TRANS', nombre: 'Almacén de Tránsito', direccion: 'Panamericana Sur Km 18, VES', responsable: 'Jorge Rivas', estado: 'inactivo' },
];

const kardex: KardexItem[] = [
  { id: 'KDX-001', producto: 'Cemento Tipo I', almacen: 'Almacén Central', tipo: 'Entrada', cantidad: 180, saldo: 180, fecha: '2026-10-01', referencia: 'OC-2026-002' },
  { id: 'KDX-002', producto: 'Cemento Tipo I', almacen: 'Almacén Central', tipo: 'Salida', cantidad: 60, saldo: 120, fecha: '2026-10-02', referencia: 'M-00014' },
  { id: 'KDX-003', producto: 'Malla de acero 10mm', almacen: 'Almacén Norte', tipo: 'Transferencia', cantidad: 15, saldo: 78, fecha: '2026-10-03', referencia: 'TR-1201' },
  { id: 'KDX-004', producto: 'Cable eléctrico 3x2.5', almacen: 'Almacén Central', tipo: 'Ajuste', cantidad: 8, saldo: 50, fecha: '2026-10-03', referencia: 'AJ-0303' },
];

const transferencias: Transferencia[] = [
  { id: 'TR-1201', origen: 'Almacén Central', destino: 'Almacén Norte', producto: 'Malla de acero 10mm', cantidad: 15, fecha: '2026-10-03', estado: 'Completada' },
  { id: 'TR-1202', origen: 'Almacén Central', destino: 'Almacén Norte', producto: 'Cable eléctrico 3x2.5', cantidad: 20, fecha: '2026-10-04', estado: 'En tránsito' },
  { id: 'TR-1203', origen: 'Almacén Norte', destino: 'Almacén Central', producto: 'Cemento Tipo I', cantidad: 30, fecha: '2026-10-05', estado: 'Programada' },
];

const tabs = ['catalogo', 'almacenes', 'kardex', 'transferencias'] as const;
type TabName = (typeof tabs)[number];

export function InventarioPage() {
  const [activeTab, setActiveTab] = useState<TabName>('catalogo');
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('todas');

  const productosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productos.filter((producto) => {
      const matchesText = q.length === 0 || producto.nombre.toLowerCase().includes(q) || producto.sku.toLowerCase().includes(q);
      const matchesCategoria = categoria === 'todas' || producto.categoria === categoria;
      return matchesText && matchesCategoria;
    });
  }, [search, categoria]);

  const categorias = Array.from(new Set(productos.map((p) => p.categoria)));

  const renderStatus = (text: string, tone: 'success' | 'warning' | 'neutral' | 'danger' = 'neutral') => {
    const palette = {
      success: { bg: '#ECFDF5', color: '#047857' },
      warning: { bg: '#FFFBEB', color: '#B45309' },
      neutral: { bg: '#F8FAFC', color: '#475569' },
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
          background: palette[tone].bg,
          color: palette[tone].color,
        }}
      >
        {text}
      </span>
    );
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header style={{ ...panelStyle, padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Inventario</p>
          <h1 style={{ margin: '8px 0 0', fontSize: '2rem', color: '#020817' }}>Catálogo y almacenes</h1>
        </div>
        <Button variant="primary">Nuevo producto</Button>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div style={{ ...panelStyle, padding: '18px 20px' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Productos</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{productos.length}</h2>
        </div>
        <div style={{ ...panelStyle, padding: '18px 20px' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Almacenes</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{almacenes.length}</h2>
        </div>
        <div style={{ ...panelStyle, padding: '18px 20px' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Stock bajo</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{productos.filter((p) => p.stock <= p.stockMinimo).length}</h2>
        </div>
        <div style={{ ...panelStyle, padding: '18px 20px' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Valor total</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '1.7rem' }}>{currency.format(productos.reduce((sum, p) => sum + p.stock * p.precioCompra, 0))}</h2>
        </div>
      </section>

      <section style={{ ...panelStyle, padding: '18px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '9px 12px',
                cursor: 'pointer',
                background: activeTab === tab ? '#2563EB' : '#F1F5F9',
                color: activeTab === tab ? '#FFFFFF' : '#020817',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {tab === 'catalogo' && 'Catálogo'}
              {tab === 'almacenes' && 'Almacenes'}
              {tab === 'kardex' && 'Kardex'}
              {tab === 'transferencias' && 'Transferencias'}
            </button>
          ))}
        </div>

        {(activeTab === 'catalogo' || activeTab === 'almacenes') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(200px, 0.6fr)', gap: 12, alignItems: 'end' }}>
            {activeTab === 'catalogo' && (
              <Input
                label="Buscar producto"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="SKU o nombre"
              />
            )}
            {activeTab === 'catalogo' && (
              <Select
                label="Categoría"
                value={categoria}
                onChange={(event) => setCategoria(event.target.value)}
                options={[{ value: 'todas', label: 'Todas' }, ...categorias.map((item) => ({ value: item, label: item }))]}
              />
            )}
          </div>
        )}
      </section>

      {activeTab === 'catalogo' && (
        <section style={{ ...panelStyle, padding: 20 }}>
          <Table
            columns={[
              { key: 'sku', header: 'SKU' },
              { key: 'nombre', header: 'Producto' },
              { key: 'categoria', header: 'Categoría' },
              { key: 'unidad', header: 'Unidad' },
              { key: 'stock', header: 'Stock' },
              { key: 'stockMinimo', header: 'Stock mínimo' },
              { key: 'precioCompra', header: 'Precio compra', cell: (row: Producto) => currency.format(row.precioCompra) },
              { key: 'estado', header: 'Estado', cell: (row: Producto) => renderStatus(row.estado === 'activo' ? 'Activo' : 'Inactivo', row.estado === 'activo' ? 'success' : 'neutral') },
            ]}
            data={productosFiltrados}
            rowKey={(row) => row.id}
            emptyMessage="No hay productos con ese filtro."
          />
        </section>
      )}

      {activeTab === 'almacenes' && (
        <section style={{ ...panelStyle, padding: 20 }}>
          <Table
            columns={[
              { key: 'codigo', header: 'Código' },
              { key: 'nombre', header: 'Almacén' },
              { key: 'direccion', header: 'Dirección' },
              { key: 'responsable', header: 'Responsable' },
              { key: 'estado', header: 'Estado', cell: (row: Almacen) => renderStatus(row.estado === 'activo' ? 'Activo' : 'Inactivo', row.estado === 'activo' ? 'success' : 'neutral') },
            ]}
            data={almacenes}
            rowKey={(row) => row.id}
            emptyMessage="No hay almacenes registrados."
          />
        </section>
      )}

      {activeTab === 'kardex' && (
        <section style={{ ...panelStyle, padding: 20 }}>
          <Table
            columns={[
              { key: 'fecha', header: 'Fecha', cell: (row: KardexItem) => new Date(row.fecha).toLocaleDateString('es-PE') },
              { key: 'producto', header: 'Producto' },
              { key: 'almacen', header: 'Almacén' },
              { key: 'tipo', header: 'Tipo', cell: (row: KardexItem) => renderStatus(row.tipo, row.tipo === 'Entrada' ? 'success' : row.tipo === 'Salida' ? 'warning' : row.tipo === 'Transferencia' ? 'warning' : 'neutral') },
              { key: 'cantidad', header: 'Cantidad' },
              { key: 'saldo', header: 'Saldo' },
              { key: 'referencia', header: 'Referencia' },
            ]}
            data={kardex}
            rowKey={(row) => row.id}
            emptyMessage="No hay movimientos de kardex."
          />
        </section>
      )}

      {activeTab === 'transferencias' && (
        <section style={{ ...panelStyle, padding: 20 }}>
          <Table
            columns={[
              { key: 'id', header: 'Transferencia' },
              { key: 'producto', header: 'Producto' },
              { key: 'origen', header: 'Origen' },
              { key: 'destino', header: 'Destino' },
              { key: 'cantidad', header: 'Cantidad' },
              { key: 'fecha', header: 'Fecha', cell: (row: Transferencia) => new Date(row.fecha).toLocaleDateString('es-PE') },
              { key: 'estado', header: 'Estado', cell: (row: Transferencia) => renderStatus(row.estado, row.estado === 'Completada' ? 'success' : row.estado === 'En tránsito' ? 'warning' : 'neutral') },
            ]}
            data={transferencias}
            rowKey={(row) => row.id}
            emptyMessage="No hay transferencias registradas."
          />
        </section>
      )}
    </div>
  );
}
