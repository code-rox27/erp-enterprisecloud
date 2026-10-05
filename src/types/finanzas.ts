// ───────── Cuentas por cobrar / pagar ─────────
export type TipoCuenta = 'cobrar' | 'pagar';
export type MedioPago = 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
export type EstadoCuenta = 'pendiente' | 'parcial' | 'vencida' | 'pagada';
import type { EntidadRef } from './comun';

export interface PagoCuenta {
  id: string;
  fecha: string; // YYYY-MM-DD
  monto: number;
  medio: MedioPago;
  referencia: string;
  /** Cuenta bancaria usada (si el medio no fue efectivo). */
  cuentaBancariaId?: string;
  /** Movimiento de Caja o Bancos que generó este pago/cobro. */
  movimientoId?: string;
}

export interface Cuenta {
  id: string;
  tipo: TipoCuenta;
  /** Id del cliente (CxC) o proveedor (CxP). */
  contraparteId: string;
  /** Nombre al momento de emitir el documento (para mostrar). */
  contraparte: string;
  documento: string;
  /** Id del documento (factura/comprobante) en el repositorio de Documentos. */
  documentoId?: string;
  /** Operación que originó la cuenta: venta (CxC) o compra (CxP). */
  origen: EntidadRef;
  emision: string; // YYYY-MM-DD
  vencimiento: string; // YYYY-MM-DD
  monto: number;
  saldo: number;
  pagos: PagoCuenta[];
}

export type PagoInput = Omit<PagoCuenta, 'id' | 'movimientoId'>;

// ───────── Caja ─────────
export const DENOMINACIONES = [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1] as const;

/** Cantidad contada por denominación. Clave = String(denominación). */
export type ConteoEfectivo = Record<string, number>;

export type TipoMovimientoCaja = 'ingreso' | 'egreso';

export interface MovimientoCaja {
  id: string;
  fecha: string;
  hora: string; // HH:mm
  tipo: TipoMovimientoCaja;
  concepto: string;
  monto: number;
  /** Si lo generó un cobro/pago, la CxC/CxP de origen. */
  origenCuentaId?: string;
}
export type MovimientoCajaInput = Pick<MovimientoCaja, 'tipo' | 'concepto' | 'monto'>;

export interface CajaDelDia {
  fecha: string;
  saldoInicial: number;
  movimientos: MovimientoCaja[];
}

export interface ArqueoCaja {
  id: string;
  fecha: string;
  hora: string;
  responsable: string;
  saldoEsperado: number;
  efectivoContado: number;
  /** contado − esperado: negativo = faltante, positivo = sobrante. */
  diferencia: number;
  conteo: ConteoEfectivo;
  observaciones: string;
}

export interface ArqueoInput {
  responsable: string;
  conteo: ConteoEfectivo;
  observaciones: string;
}

// ───────── Bancos ─────────
export type Moneda = 'PEN' | 'USD';

export interface CuentaBancaria {
  id: string;
  banco: string;
  alias: string;
  /** Solo los últimos dígitos, nunca el número completo. */
  numeroEnmascarado: string;
  moneda: Moneda;
  saldoInicial: number;
}

export interface MovimientoBancario {
  id: string;
  cuentaId: string; // cuenta bancaria
  fecha: string;
  descripcion: string;
  referencia: string;
  tipo: 'abono' | 'cargo';
  monto: number;
  conciliado: boolean;
  /** Si lo generó un cobro/pago, la CxC/CxP de origen. */
  origenCuentaId?: string;
}