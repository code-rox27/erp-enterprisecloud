import type { Existencia, Producto } from '@/types/inventario';
import { round2 } from './formatters';

/** Suma las existencias de todos los almacenes por producto. */
export function stockTotalPorProducto(
  existencias: readonly Existencia[],
): Record<string, number> {
  const total: Record<string, number> = {};
  for (const e of existencias) {
    total[e.productoId] = (total[e.productoId] ?? 0) + e.cantidad;
  }
  return total;
}

export function stockEn(
  existencias: readonly Existencia[],
  productoId: string,
  almacenId: string,
): number {
  return existencias.find((e) => e.productoId === productoId && e.almacenId === almacenId)?.cantidad ?? 0;
}

/** Productos activos en o bajo su mínimo. El Dashboard puede reutilizarlo para las alertas de stock crítico. */
export function productosConStockBajo(
  productos: readonly Producto[],
  stock: Record<string, number>,
): Producto[] {
  return productos.filter((p) => p.estado === 'activo' && (stock[p.id] ?? 0) <= p.stockMinimo);
}

export function valorInventario(
  productos: readonly Producto[],
  stock: Record<string, number>,
): number {
  return round2(productos.reduce((sum, p) => sum + (stock[p.id] ?? 0) * p.precioCompra, 0));
}