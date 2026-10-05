import type { EntidadRef, Estado } from './comun';

export const UNIDADES = ['UND', 'KG', 'LT', 'CJA'] as const;
export type UnidadMedida = (typeof UNIDADES)[number];

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  unidad: UnidadMedida;
  precioCompra: number; // PEN
  precioVenta: number; // PEN
  stockMinimo: number;
  estado: Estado;
}

/** El stock NO vive en el producto: se guarda por almacén (Producto → Inventario). */
export type ProductoInput = Omit<Producto, 'id' | 'estado'>;

export interface Almacen {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  responsable: string;
  estado: Estado;
}

export interface Existencia {
  productoId: string;
  almacenId: string;
  cantidad: number;
}

export type TipoMovimientoKardex =
  | 'entrada' // recepción de compra, devolución de venta
  | 'salida' // venta, devolución de compra
  | 'ajuste_positivo'
  | 'ajuste_negativo'
  | 'transferencia_entrada'
  | 'transferencia_salida';

const TIPOS_ENTRADA: readonly TipoMovimientoKardex[] = [
  'entrada',
  'ajuste_positivo',
  'transferencia_entrada',
];

export const esEntrada = (tipo: TipoMovimientoKardex): boolean => TIPOS_ENTRADA.includes(tipo);

export interface MovimientoKardex {
  id: string;
  fecha: string; // YYYY-MM-DD
  productoId: string;
  almacenId: string;
  tipo: TipoMovimientoKardex;
  /** Siempre positiva; el sentido lo da el tipo. */
  cantidad: number;
  /** Existencia del producto en ese almacén DESPUÉS del movimiento. */
  saldo: number;
  referencia: EntidadRef;
  observacion?: string;
}

/** Entrada común para registrar cualquier movimiento (la usarán Compras y Ventas). */
export interface MovimientoInput {
  productoId: string;
  almacenId: string;
  tipo: TipoMovimientoKardex;
  cantidad: number;
  referencia: EntidadRef;
  observacion?: string;
  fecha?: string;
}

export type EstadoTransferencia = 'programada' | 'en_transito' | 'completada' | 'cancelada';

export interface Transferencia {
  id: string;
  codigo: string;
  origenId: string;
  destinoId: string;
  productoId: string;
  cantidad: number;
  fecha: string;
  estado: EstadoTransferencia;
}

export type TransferenciaInput = Pick<
  Transferencia,
  'origenId' | 'destinoId' | 'productoId' | 'cantidad' | 'fecha'
>;

export interface AjusteInput {
  productoId: string;
  almacenId: string;
  sentido: 'positivo' | 'negativo';
  cantidad: number;
  motivo: string;
}

export interface InventarioSnapshot {
  productos: Producto[];
  almacenes: Almacen[];
  existencias: Existencia[];
  kardex: MovimientoKardex[];
  transferencias: Transferencia[];
}