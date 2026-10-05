import type { Cuenta } from './finanzas';
import type { Almacen, Producto } from './inventario';
import type { Proveedor } from './proveedor';

export type Prioridad = 'baja' | 'media' | 'alta';

export type EstadoOrden =
  | 'pendiente' // espera aprobación
  | 'aprobada'
  | 'recibida_parcial'
  | 'recibida'
  | 'rechazada'
  | 'cancelada';

export interface OrdenLinea {
  productoId: string;
  cantidad: number;
  costoUnitario: number;
  cantidadRecibida: number;
}

export interface OrdenCompra {
  id: string;
  codigo: string; // OC-2026-001
  proveedorId: string;
  fecha: string; // YYYY-MM-DD
  prioridad: Prioridad;
  estado: EstadoOrden;
  lineas: OrdenLinea[];
}

export interface OrdenInput {
  proveedorId: string;
  prioridad: Prioridad;
  lineas: Array<{ productoId: string; cantidad: number; costoUnitario: number }>;
}

export interface RecepcionCompra {
  id: string;
  codigo: string; // RC-7001
  ordenId: string;
  fecha: string;
  almacenId: string;
  lineas: Array<{ productoId: string; cantidad: number }>;
}

export interface RecepcionInput {
  ordenId: string;
  almacenId: string;
  lineas: Array<{ productoId: string; cantidad: number }>;
}

export interface FacturaCompra {
  id: string;
  codigo: string; // F005-4410
  ordenId: string;
  proveedorId: string;
  fecha: string;
  vencimiento: string;
  monto: number;
  /** CxP generada por esta factura (Finanzas). */
  cuentaId: string;
}

export interface FacturaInput {
  ordenId: string;
  codigo: string;
  fecha: string;
}

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface SolicitudCompra {
  id: string;
  codigo: string;
  descripcion: string;
  proveedorId: string;
  fecha: string;
  monto: number;
  prioridad: Prioridad;
  estado: EstadoSolicitud;
}

export type EstadoDevolucion = 'solicitada' | 'aprobada' | 'procesada';

export interface DevolucionCompra {
  id: string;
  codigo: string;
  ordenId: string;
  proveedorId: string;
  productoId: string;
  motivo: string;
  monto: number;
  estado: EstadoDevolucion;
}

export interface ComprasSnapshot {
  ordenes: OrdenCompra[];
  recepciones: RecepcionCompra[];
  facturas: FacturaCompra[];
  solicitudes: SolicitudCompra[];
  devoluciones: DevolucionCompra[];
  proveedores: Proveedor[];
  productos: Producto[];
  almacenes: Almacen[];
  /** Solo las cuentas por pagar. */
  cuentas: Cuenta[];
}