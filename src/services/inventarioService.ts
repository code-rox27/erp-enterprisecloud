import type { EntidadRef } from '@/types/comun';
import {
  esEntrada,
  type AjusteInput,
  type InventarioSnapshot,
  type MovimientoInput,
  type MovimientoKardex,
  type Producto,
  type ProductoInput,
  type Transferencia,
  type TransferenciaInput,
} from '@/types/inventario';
import { todayISO } from '@/utils/dates';
import { delay, generateId } from '@/utils/delay';
import { db } from './mockDb';

const roundQty = (n: number): number => Math.round(n * 1000) / 1000;

/**
 * PUNTO DE INTEGRACIÓN: única forma de modificar el stock.
 * Valida, actualiza la existencia por almacén y deja el asiento en el Kardex.
 * Compras (recepción), Ventas y Devoluciones deben llamar a esta función.
 * Es síncrona a propósito: así otros servicios mock pueden usarla dentro de su
 * propia operación sin romper la atomicidad (si lanza, no se modificó nada).
 */
export function aplicarMovimiento(input: MovimientoInput): MovimientoKardex {
  const { productoId, almacenId, tipo, cantidad } = input;

  if (!(cantidad > 0)) throw new Error('La cantidad debe ser mayor a cero');
  const producto = db.productos.find((p) => p.id === productoId);
  if (!producto) throw new Error('Producto no encontrado');
  const almacen = db.almacenes.find((a) => a.id === almacenId);
  if (!almacen) throw new Error('Almacén no encontrado');

  const existencia = db.existencias.find(
    (e) => e.productoId === productoId && e.almacenId === almacenId,
  );
  const actual = existencia?.cantidad ?? 0;
  const nueva = roundQty(actual + (esEntrada(tipo) ? cantidad : -cantidad));

  if (nueva < 0) {
    throw new Error(
      `Stock insuficiente de "${producto.nombre}" en ${almacen.nombre}: disponible ${actual} ${producto.unidad}`,
    );
  }

  if (existencia) existencia.cantidad = nueva;
  else db.existencias.push({ productoId, almacenId, cantidad: nueva });

  const movimiento: MovimientoKardex = {
    id: generateId('kdx'),
    fecha: input.fecha ?? todayISO(),
    productoId,
    almacenId,
    tipo,
    cantidad: roundQty(cantidad),
    saldo: nueva,
    referencia: input.referencia,
    observacion: input.observacion,
  };
  db.kardex.push(movimiento);
  return movimiento;
}

export const inventarioService = {
  async getSnapshot(): Promise<InventarioSnapshot> {
    await delay();
    return structuredClone({
      productos: db.productos,
      almacenes: db.almacenes,
      existencias: db.existencias,
      kardex: db.kardex,
      transferencias: db.transferencias,
    });
  },

  async crearProducto(input: ProductoInput): Promise<Producto> {
    await delay();
    const sku = input.sku.trim().toUpperCase();
    if (db.productos.some((p) => p.sku === sku)) {
      throw new Error(`Ya existe un producto con el SKU ${sku}`);
    }
    const nuevo: Producto = {
      ...input,
      sku,
      nombre: input.nombre.trim(),
      categoria: input.categoria.trim(),
      id: generateId('prod'),
      estado: 'activo',
    };
    db.productos.push(nuevo);
    return structuredClone(nuevo);
  },

  async registrarAjuste(input: AjusteInput): Promise<MovimientoKardex> {
    await delay(400);
    const motivo = input.motivo.trim();
    if (motivo.length < 3) throw new Error('Indica el motivo del ajuste');

    const numero = db.kardex.filter((k) => k.referencia.tipo === 'ajuste').length + 303;
    const referencia: EntidadRef = {
      tipo: 'ajuste',
      id: generateId('aj'),
      codigo: `AJ-${String(numero).padStart(4, '0')}`,
    };
    const movimiento = aplicarMovimiento({
      productoId: input.productoId,
      almacenId: input.almacenId,
      tipo: input.sentido === 'positivo' ? 'ajuste_positivo' : 'ajuste_negativo',
      cantidad: input.cantidad,
      referencia,
      observacion: motivo,
    });
    return structuredClone(movimiento);
  },

  async crearTransferencia(input: TransferenciaInput): Promise<Transferencia> {
    await delay();
    if (input.origenId === input.destinoId) {
      throw new Error('El origen y el destino deben ser distintos');
    }
    if (!(input.cantidad > 0)) throw new Error('La cantidad debe ser mayor a cero');

    const producto = db.productos.find((p) => p.id === input.productoId);
    if (!producto || producto.estado !== 'activo') throw new Error('Producto no disponible');

    for (const id of [input.origenId, input.destinoId]) {
      const almacen = db.almacenes.find((a) => a.id === id);
      if (!almacen || almacen.estado !== 'activo') {
        throw new Error('Solo se puede transferir entre almacenes activos');
      }
    }

    const nueva: Transferencia = {
      ...input,
      id: generateId('tr'),
      codigo: `TR-${1200 + db.transferencias.length + 1}`,
      estado: 'programada',
    };
    db.transferencias.push(nueva);
    return structuredClone(nueva);
  },

  /**
   * programada → en tránsito: descuenta del origen.
   * en tránsito → completada: suma al destino.
   */
  async avanzarTransferencia(id: string): Promise<Transferencia> {
    await delay(400);
    const t = db.transferencias.find((x) => x.id === id);
    if (!t) throw new Error('Transferencia no encontrada');

    const referencia: EntidadRef = { tipo: 'transferencia', id: t.id, codigo: t.codigo };

    if (t.estado === 'programada') {
      aplicarMovimiento({
        productoId: t.productoId,
        almacenId: t.origenId,
        tipo: 'transferencia_salida',
        cantidad: t.cantidad,
        referencia,
      });
      t.estado = 'en_transito';
    } else if (t.estado === 'en_transito') {
      aplicarMovimiento({
        productoId: t.productoId,
        almacenId: t.destinoId,
        tipo: 'transferencia_entrada',
        cantidad: t.cantidad,
        referencia,
      });
      t.estado = 'completada';
    } else {
      throw new Error('Esta transferencia ya no puede avanzar');
    }
    return structuredClone(t);
  },

  async cancelarTransferencia(id: string): Promise<Transferencia> {
    await delay(300);
    const t = db.transferencias.find((x) => x.id === id);
    if (!t) throw new Error('Transferencia no encontrada');
    if (t.estado !== 'programada') {
      throw new Error('Solo se pueden cancelar transferencias programadas');
    }
    t.estado = 'cancelada';
    return structuredClone(t);
  },

  /** Para que Compras (recepción) y Ventas usen el mismo punto de entrada. */
  async registrarMovimiento(input: MovimientoInput): Promise<MovimientoKardex> {
    await delay(300);
    return structuredClone(aplicarMovimiento(input));
  },
};