import { useMemo, useState } from 'react';
import { Badge, Select, Table, type BadgeVariant, type TableColumn } from '@/components/ui';
import {
  esEntrada,
  type Almacen,
  type MovimientoKardex,
  type Producto,
  type TipoMovimientoKardex,
} from '@/types/inventario';
import { formatDate } from '@/utils/formatters';

interface Props {
  kardex: readonly MovimientoKardex[];
  productos: readonly Producto[];
  almacenes: readonly Almacen[];
  productoPorId: Map<string, Producto>;
  almacenPorId: Map<string, Almacen>;
  isLoading: boolean;
}

const TIPOS: Record<TipoMovimientoKardex, { label: string; variant: BadgeVariant }> = {
  entrada: { label: 'Entrada', variant: 'success' },
  salida: { label: 'Salida', variant: 'warning' },
  ajuste_positivo: { label: 'Ajuste (+)', variant: 'neutral' },
  ajuste_negativo: { label: 'Ajuste (−)', variant: 'neutral' },
  transferencia_entrada: { label: 'Transf. (entrada)', variant: 'info' },
  transferencia_salida: { label: 'Transf. (salida)', variant: 'info' },
};

export function KardexTab({
  kardex,
  productos,
  almacenes,
  productoPorId,
  almacenPorId,
  isLoading,
}: Props) {
  const [productoId, setProductoId] = useState('');
  const [almacenId, setAlmacenId] = useState('');

  // Más recientes primero
  const filtrado = useMemo(
    () =>
      kardex
        .filter(
          (m) =>
            (productoId === '' || m.productoId === productoId) &&
            (almacenId === '' || m.almacenId === almacenId),
        )
        .reverse(),
    [kardex, productoId, almacenId],
  );

  const columns: TableColumn<MovimientoKardex>[] = [
    { key: 'fecha', header: 'Fecha', cell: (m) => formatDate(m.fecha) },
    { key: 'producto', header: 'Producto', cell: (m) => productoPorId.get(m.productoId)?.nombre ?? m.productoId },
    { key: 'almacen', header: 'Almacén', cell: (m) => almacenPorId.get(m.almacenId)?.nombre ?? m.almacenId },
    {
      key: 'tipo',
      header: 'Tipo',
      cell: (m) => <Badge variant={TIPOS[m.tipo].variant}>{TIPOS[m.tipo].label}</Badge>,
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
      align: 'right',
      cell: (m) =>
        esEntrada(m.tipo) ? (
          <span className="text-emerald-600">+{m.cantidad}</span>
        ) : (
          <span className="text-destructive">−{m.cantidad}</span>
        ),
    },
    { key: 'saldo', header: 'Saldo', align: 'right' },
    {
      key: 'referencia',
      header: 'Referencia',
      cell: (m) => (
        <div>
          <p>{m.referencia.codigo}</p>
          {m.observacion && <p className="text-xs text-muted-foreground">{m.observacion}</p>}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          aria-label="Filtrar por producto"
          placeholder="Todos los productos"
          options={productos.map((p) => ({ value: p.id, label: `${p.sku} · ${p.nombre}` }))}
          value={productoId}
          onChange={(e) => setProductoId(e.target.value)}
        />
        <Select
          aria-label="Filtrar por almacén"
          placeholder="Todos los almacenes"
          options={almacenes.map((a) => ({ value: a.id, label: a.nombre }))}
          value={almacenId}
          onChange={(e) => setAlmacenId(e.target.value)}
        />
      </div>
      <Table<MovimientoKardex>
        columns={columns}
        data={filtrado}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        emptyMessage="No hay movimientos de Kardex con ese filtro."
      />
    </div>
  );
}