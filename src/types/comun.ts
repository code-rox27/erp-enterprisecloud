export type Estado = 'activo' | 'inactivo';

/**
 * Referencia a la operación de negocio que originó algo (movimiento de Kardex,
 * documento adjunto, etc.). Es la base de la relación Documento → Entidad.
 */
export type EntidadTipo = 'compra' | 'venta' | 'transferencia' | 'ajuste';

export interface EntidadRef {
  tipo: EntidadTipo;
  id: string;
  /** Código legible: OC-2026-001, VT-00014, TR-1201… */
  codigo: string;
}