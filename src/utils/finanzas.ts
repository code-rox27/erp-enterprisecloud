import type {
  ConteoEfectivo,
  Cuenta,
  CuentaBancaria,
  EstadoCuenta,
  MovimientoBancario,
  MovimientoCaja,
} from '@/types/finanzas';
import { todayISO } from './dates';
import { round2 } from './formatters';

export function getEstadoCuenta(
  c: Pick<Cuenta, 'saldo' | 'monto' | 'vencimiento'>,
  hoy: string = todayISO(),
): EstadoCuenta {
  if (c.saldo <= 0) return 'pagada';
  if (c.vencimiento < hoy) return 'vencida'; // ISO: la comparación de texto es válida
  return c.saldo < c.monto ? 'parcial' : 'pendiente';
}

/** Suma el conteo trabajando en céntimos para evitar errores de coma flotante. */
export function totalConteo(conteo: ConteoEfectivo): number {
  const centimos = Object.entries(conteo).reduce(
    (acc, [denominacion, cantidad]) => acc + Math.round(Number(denominacion) * 100) * cantidad,
    0,
  );
  return centimos / 100;
}

export function resumenCaja(saldoInicial: number, movimientos: readonly MovimientoCaja[]) {
  const ingresos = round2(
    movimientos.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0),
  );
  const egresos = round2(
    movimientos.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0),
  );
  return { ingresos, egresos, saldoEsperado: round2(saldoInicial + ingresos - egresos) };
}

const efecto = (m: MovimientoBancario): number => (m.tipo === 'abono' ? m.monto : -m.monto);

export function resumenBanco(
  cuenta: CuentaBancaria,
  movimientos: readonly MovimientoBancario[],
) {
  const propios = movimientos.filter((m) => m.cuentaId === cuenta.id);
  const sum = (list: readonly MovimientoBancario[]) => list.reduce((s, m) => s + efecto(m), 0);
  const pendientes = propios.filter((m) => !m.conciliado);
  return {
    saldoLibros: round2(cuenta.saldoInicial + sum(propios)),
    saldoConciliado: round2(cuenta.saldoInicial + sum(propios.filter((m) => m.conciliado))),
    cantidadPendientes: pendientes.length,
    montoPendiente: round2(sum(pendientes)),
  };
}