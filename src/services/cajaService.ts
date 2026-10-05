import type {
  ArqueoCaja,
  ArqueoInput,
  CajaDelDia,
  MovimientoCaja,
  MovimientoCajaInput,
} from '@/types/finanzas';
import { nowHHmm, todayISO } from '@/utils/dates';
import { resumenCaja, totalConteo } from '@/utils/finanzas';
import { formatCurrency, round2 } from '@/utils/formatters';
import { delay, generateId } from '@/utils/delay';
import { db } from './mockDb';

const movimientosDeHoy = (): MovimientoCaja[] => {
  const hoy = todayISO();
  return db.movimientosCaja.filter((m) => m.fecha === hoy);
};

/**
 * PUNTO DE INTEGRACIÓN: única forma de modificar la caja del día.
 * Síncrona y validada de antemano: si lanza, no se modificó nada.
 * La usan los cobros y pagos en efectivo de Finanzas.
 */
export function aplicarMovimientoCaja(
  input: MovimientoCajaInput & { origenCuentaId?: string },
): MovimientoCaja {
  if (!(input.monto > 0)) throw new Error('El monto debe ser mayor a cero');

  if (input.tipo === 'egreso') {
    const { saldoEsperado } = resumenCaja(db.cajaSaldoInicial, movimientosDeHoy());
    if (input.monto > saldoEsperado + 0.001) {
      throw new Error(`Caja sin fondos suficientes: disponible ${formatCurrency(saldoEsperado)}`);
    }
  }

  const nuevo: MovimientoCaja = {
    id: generateId('mc'),
    fecha: todayISO(),
    hora: nowHHmm(),
    tipo: input.tipo,
    concepto: input.concepto,
    monto: input.monto,
    origenCuentaId: input.origenCuentaId,
  };
  db.movimientosCaja.push(nuevo);
  return nuevo;
}

export const cajaService = {
  async getDelDia(): Promise<CajaDelDia> {
    await delay(400);
    return structuredClone({
      fecha: todayISO(),
      saldoInicial: db.cajaSaldoInicial,
      movimientos: movimientosDeHoy(),
    });
  },

  async addMovimiento(input: MovimientoCajaInput): Promise<MovimientoCaja> {
    await delay(300);
    return structuredClone(aplicarMovimientoCaja(input));
  },

  async listArqueos(): Promise<ArqueoCaja[]> {
    await delay(300);
    return structuredClone(db.arqueos);
  },

  /** El saldo esperado lo calcula el "servidor", no la pantalla. */
  async registrarArqueo(input: ArqueoInput): Promise<ArqueoCaja> {
    await delay(500);
    const { saldoEsperado } = resumenCaja(db.cajaSaldoInicial, movimientosDeHoy());
    const efectivoContado = totalConteo(input.conteo);
    const diferencia = round2(efectivoContado - saldoEsperado);
    if (diferencia !== 0 && input.observaciones.trim() === '') {
      throw new Error('Debes indicar una observación cuando existe diferencia');
    }
    const nuevo: ArqueoCaja = {
      id: generateId('aq'),
      fecha: todayISO(),
      hora: nowHHmm(),
      responsable: input.responsable.trim(),
      saldoEsperado,
      efectivoContado,
      diferencia,
      conteo: input.conteo,
      observaciones: input.observaciones.trim(),
    };
    db.arqueos.unshift(nuevo);
    return structuredClone(nuevo);
  },
};