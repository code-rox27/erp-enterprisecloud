export type UnidadMedida = 'UND' | 'KG' | 'LT' | 'CJA';

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  unidad: UnidadMedida;
  precioCompra: number; // PEN
  precioVenta: number; // PEN
  stockMinimo: number;
  estado: 'activo' | 'inactivo';
}