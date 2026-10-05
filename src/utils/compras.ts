import type { EstadoOrden, OrdenCompra, OrdenLinea } from '@/types/compras';
import { round2 } from './formatters';

export const totalOrden = (orden: Pick<OrdenCompra, 'lineas'>): number =>
  round2(orden.lineas.reduce((sum, l) => sum + l.cantidad * l.costoUnitario, 0));

export const pendienteLinea = (l: Pick<OrdenLinea, 'cantidad' | 'cantidadRecibida'>): number =>
  Math.round((l.cantidad - l.cantidadRecibida) * 1000) / 1000;

export const esRecibible = (estado: EstadoOrden): boolean =>
  estado === 'aprobada' || estado === 'recibida_parcial';

/** Formato de comprobante de proveedor: serie de 3-4 caracteres + guion + número. Ej: F005-4410 */
export const FACTURA_REGEX = /^[A-Z0-9]{3,4}-\d{1,8}$/;