import type { CuentaBancaria, MovimientoBancario } from '@/types/finanzas';
import { todayISO } from '@/utils/dates';
import { delay, generateId } from '@/utils/delay';
import { db } from './mockDb';

interface MovimientoBancarioInput {
  cuentaId: string;
  tipo: MovimientoBancario['tipo'];
  monto: number;
  descripcion: string;
  referencia: string;
  fecha?: string;
  origenCuentaId?: string;
}

/**
 * PUNTO DE INTEGRACIÓN: registra un abono o cargo en una cuenta bancaria.
 * Queda pendiente de conciliar. Síncrona: si lanza, no se modificó nada.
 */
export function aplicarMovimientoBancario(input: MovimientoBancarioInput): MovimientoBancario {
  if (!(input.monto > 0)) throw new Error('El monto debe ser mayor a cero');
  if (!db.cuentasBancarias.some((c) => c.id === input.cuentaId)) {
    throw new Error('Cuenta bancaria no encontrada');
  }
  const nuevo: MovimientoBancario = {
    id: generateId('mb'),
    cuentaId: input.cuentaId,
    fecha: input.fecha ?? todayISO(),
    descripcion: input.descripcion,
    referencia: input.referencia,
    tipo: input.tipo,
    monto: input.monto,
    conciliado: false,
    origenCuentaId: input.origenCuentaId,
  };
  db.movimientosBancarios.push(nuevo);
  return nuevo;
}

export const bancoService = {
  async getAll(): Promise<{ cuentas: CuentaBancaria[]; movimientos: MovimientoBancario[] }> {
    await delay();
    return structuredClone({
      cuentas: db.cuentasBancarias,
      movimientos: db.movimientosBancarios,
    });
  },

  async listCuentas(): Promise<CuentaBancaria[]> {
    await delay(200);
    return structuredClone(db.cuentasBancarias);
  },

  async conciliar(id: string): Promise<MovimientoBancario> {
    await delay(300);
    const actual = db.movimientosBancarios.find((m) => m.id === id);
    if (!actual) throw new Error('Movimiento no encontrado');
    actual.conciliado = true;
    return structuredClone(actual);
  },
};