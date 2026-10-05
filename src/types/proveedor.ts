export const CATEGORIAS_PROVEEDOR = [
  'Materia prima',
  'Insumos',
  'Servicios',
  'Tecnología',
  'Logística',
] as const;

export type CategoriaProveedor = (typeof CATEGORIAS_PROVEEDOR)[number];
export type EstadoProveedor = 'activo' | 'inactivo';

export interface ContactoProveedor {
  id: string;
  nombre: string;
  cargo: string;
  email: string;
  telefono: string;
  principal: boolean;
}

export interface Proveedor {
  id: string;
  ruc: string;
  razonSocial: string;
  categoria: CategoriaProveedor;
  email: string;
  telefono: string;
  direccion: string;
  estado: EstadoProveedor;
  contactos: ContactoProveedor[];
  creadoEn: string; // ISO
  /** Línea de crédito aprobada en PEN (0 = sin crédito). */
  lineaCredito: number;
  /** Plazo de pago en días (0 = contado). Define el vencimiento de sus facturas. */
  plazoPagoDias: number;
}

/** Datos editables desde el formulario. */
export type ProveedorInput = Pick<
  Proveedor,
  'ruc' | 'razonSocial' | 'categoria' | 'email' | 'telefono' | 'direccion'
>;

export type ContactoInput = Omit<ContactoProveedor, 'id' | 'principal'>;