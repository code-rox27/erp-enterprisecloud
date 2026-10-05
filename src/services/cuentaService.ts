import type { EntidadRef } from '@/types/comun';
import type { Cuenta, PagoCuenta, PagoInput, TipoCuenta } from '@/types/finanzas';
import { todayISO } from '@/utils/dates';
import { round2 } from '@/utils/formatters';
import { delay, generateId } from '@/utils/delay';
import { db } from './mockDb';
import { aplicarMovimientoBancario } from './bancoService';
import { aplicarMovimientoCaja } from './cajaService';

export interface NuevaCuenta {
  tipo: TipoCuenta;
  contraparteId: string;
  contraparte: string;
  documento: string;
  documentoId?: string;
  origen: EntidadRef;
  emision: string;
  vencimiento: string;
  monto: number;
}

/**
 * PUNTO DE INTEGRACIÓN: crea una CxC (desde una venta) o una CxP (desde una factura de compra).
 * Síncrona, para usarla dentro de la operación del módulo de origen.
 */
export function registrarCuenta(input: NuevaCuenta): Cuenta {
  if (!(input.monto > 0)) throw new Error('El monto de la cuenta debe ser mayor a cero');
  const cuenta: Cuenta = {
    ...input,
    id: generateId(input.tipo === 'cobrar' ? 'cxc' : 'cxp'),
    saldo: input.monto,
    pagos: [],
  };
  db.cuentas.push(cuenta);
  return cuenta;
}

export const cuentaService = {
  async list(tipo: TipoCuenta): Promise<Cuenta[]> {
    await delay();
    return structuredClone(db.cuentas.filter((c) => c.tipo === tipo));
  },

  /**
   * Registra el cobro/pago y genera su movimiento:
   * efectivo → Caja de hoy; transferencia, cheque o tarjeta → Bancos (pendiente de conciliar).
   */
  async registrarPago(id: string, input: PagoInput): Promise<Cuenta> {
    await delay(400);
    const cuenta = db.cuentas.find((c) => c.id === id);
    if (!cuenta) throw new Error('Cuenta no encontrada');
    if (!(input.monto > 0)) throw new Error('El monto debe ser mayor a cero');
    if (input.monto > cuenta.saldo + 0.001) throw new Error('El monto excede el saldo pendiente');

    const esCobro = cuenta.tipo === 'cobrar';
    const concepto = `${esCobro ? 'Cobro' : 'Pago'} ${cuenta.documento} · ${cuenta.contraparte}`;

    // 1) Validar todo antes de modificar nada
    if (input.medio === 'efectivo') {
      if (input.fecha !== todayISO()) {
        throw new Error('Los pagos en efectivo se registran con la fecha de hoy (afectan la caja del día)');
      }
    } else {
      const banco = db.cuentasBancarias.find((b) => b.id === input.cuentaBancariaId);
      if (!banco) throw new Error('Selecciona la cuenta bancaria');
      if (banco.moneda !== 'PEN') {
        throw new Error('La cuenta bancaria debe estar en soles (aún no hay conversión de moneda)');
      }
    }

    // 2) Generar el movimiento en Caja o Bancos (si falla, la cuenta queda intacta)
    const movimiento =
      input.medio === 'efectivo'
        ? aplicarMovimientoCaja({
            tipo: esCobro ? 'ingreso' : 'egreso',
            concepto,
            monto: input.monto,
            origenCuentaId: cuenta.id,
          })
        : aplicarMovimientoBancario({
            cuentaId: input.cuentaBancariaId as string,
            tipo: esCobro ? 'abono' : 'cargo',
            monto: input.monto,
            descripcion: concepto,
            referencia: input.referencia,
            fecha: input.fecha,
            origenCuentaId: cuenta.id,
          });

    // 3) Aplicar el pago a la cuenta
    const pago: PagoCuenta = { ...input, id: generateId('pg'), movimientoId: movimiento.id };
    cuenta.saldo = round2(cuenta.saldo - input.monto);
    cuenta.pagos.push(pago);
    return structuredClone(cuenta);
  },
};