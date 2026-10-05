import { useMemo, useState } from 'react';
import { Badge, Input, Select, Table, type TableColumn } from '@/components/ui';
import type { Almacen, Existencia, Producto } from '@/types/inventario';
import { formatCurrency } from '@/utils/formatters';

interface Props {
  productos: readonly Producto[];
  categorias: readonly string[];
  existencias: readonly Existencia[];
  stockTotal: Record<string, number>;
  almacenPorId: Map<string, Almacen>;
  isLoading: boolean;
}

export function ProductosTab({
  productos,
  categorias,
  existencias,
  stockTotal,
  almacenPorId,
  isLoading,
}: Props) {
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productos.filter(
      (p) =>
        (categoria === '' || p.categoria === categoria) &&
        (q === '' || p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
    );
  }, [productos, search, categoria]);

  const columns: TableColumn<Producto>[] = [
    { key: 'sku', header: 'SKU' },
    { key: 'nombre', header: 'Producto' },
    { key: 'categoria', header: 'Categoría' },
    {
      key: 'stock',
      header: 'Stock',
      cell: (p) => {
        const total = stockTotal[p.id] ?? 0;
        const bajo = p.estado === 'activo' && total <= p.stockMinimo;
        const detalle = existencias
          .filter((e) => e.productoId === p.id && e.cantidad > 0)
          .map((e) => `${almacenPorId.get(e.almacenId)?.nombre ?? e.almacenId}: ${e.cantidad}`)
          .join(' · ');
        return (
          <div>
            <p className="flex items-center gap-2 font-medium text-foreground">
              {total} {p.unidad}
              {bajo && <Badge variant="danger">Bajo</Badge>}
            </p>
            <p className="text-xs text-muted-foreground">{detalle || 'Sin existencias'}</p>
          </div>
        );
      },
    },
    { key: 'stockMinimo', header: 'Mínimo', align: 'right' },
    { key: 'precioCompra', header: 'P. compra', align: 'right', cell: (p) => formatCurrency(p.precioCompra) },
    { key: 'precioVenta', header: 'P. venta', align: 'right', cell: (p) => formatCurrency(p.precioVenta) },
    {
      key: 'estado',
      header: 'Estado',
      cell: (p) => (
        <Badge variant={p.estado === 'activo' ? 'success' : 'neutral'} dot>
          {p.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <Input
          aria-label="Buscar producto"
          placeholder="Buscar por SKU o nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          aria-label="Filtrar por categoría"
          placeholder="Todas las categorías"
          options={categorias.map((c) => ({ value: c, label: c }))}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />
      </div>
      <Table<Producto>
        columns={columns}
        data={filtrados}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="No hay productos con ese filtro."
      />
    </div>
  );
}