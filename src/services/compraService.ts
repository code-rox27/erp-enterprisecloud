import type { EntidadRef } from '@/types/comun';
import type {
  ComprasSnapshot,
  FacturaCompra,
  FacturaInput,
  OrdenCompra,
  OrdenInput,
  RecepcionCompra,
  RecepcionInput,
} from '@/types/compras';
import { FACTURA_REGEX, pendienteLinea, totalOrden } from '@/utils/compras';
import { addDays, todayISO } from '@/utils/dates';
import { delay, generateId } from '@/utils/delay';
import { aplicarMovimiento } from './inventarioService';
import { registrarCuenta } from './cuentaService';
import { db } from './mockDb';

const roundQty = (n: number): number => Math.round(n * 1000) / 1000;

const refOrden = (o: OrdenCompra): EntidadRef => ({ tipo: 'compra', id: o.id, codigo: o.codigo });

const findOrden = (id: string): OrdenCompra => {
  const orden = db.ordenes.find((o) => o.id === id);
  if (!orden) throw new Error('Orden no encontrada');
  return orden;
};

const nombreProducto = (id: string): string => db.productos.find((p) => p.id === id)?.nombre ?? id;

export const compraService = {
  async getSnapshot(): Promise<ComprasSnapshot> {
    await delay();
    return structuredClone({
      ordenes: db.ordenes,
      recepciones: db.recepciones,
      facturas: db.facturas,
      solicitudes: db.solicitudes,
      devoluciones: db.devoluciones,
      proveedores: db.proveedores,
      productos: db.productos,
      almacenes: db.almacenes,
      cuentas: db.cuentas.filter((c) => c.tipo === 'pagar'),
    });
  },

  async crearOrden(input: OrdenInput): Promise<OrdenCompra> {
    await delay();
    const proveedor = db.proveedores.find((p) => p.id === input.proveedorId);
    if (!proveedor || proveedor.estado !== 'activo') throw new Error('Selecciona un proveedor activo');
    if (input.lineas.length === 0) throw new Error('Agrega al menos un producto');

    const vistos = new Set<string>();
    for (const l of input.lineas) {
      const producto = db.productos.find((p) => p.id === l.productoId);
      if (!producto || producto.estado !== 'activo') throw new Error('Hay un producto no disponible en la orden');
      if (vistos.has(l.productoId)) throw new Error(`"${producto.nombre}" está repetido en la orden`);
      vistos.add(l.productoId);
      if (!(l.cantidad > 0)) throw new Error(`Cantidad inválida en "${producto.nombre}"`);
      if (!(l.costoUnitario > 0)) throw new Error(`Costo inválido en "${producto.nombre}"`);
    }

    const anio = todayISO().slice(0, 4);
    const nueva: OrdenCompra = {
      id: generateId('oc'),
      codigo: `OC-${anio}-${String(db.ordenes.length + 1).padStart(3, '0')}`,
      proveedorId: input.proveedorId,
      fecha: todayISO(),
      prioridad: input.prioridad,
      estado: 'pendiente',
      lineas: input.lineas.map((l) => ({ ...l, cantidadRecibida: 0 })),
    };
    db.ordenes.unshift(nueva);
    return structuredClone(nueva);
  },

  /** Pendiente → Aprobada o Rechazada (acción de Gerente/Director). */
  async resolverAprobacion(id: string, decision: 'aprobada' | 'rechazada'): Promise<OrdenCompra> {
    await delay(300);
    const orden = findOrden(id);
    if (orden.estado !== 'pendiente') throw new Error('Solo se resuelven órdenes pendientes de aprobación');
    orden.estado = decision;
    return structuredClone(orden);
  },

  async cancelarOrden(id: string): Promise<OrdenCompra> {
    await delay(300);
    const orden = findOrden(id);
    if (orden.estado !== 'pendiente' && orden.estado !== 'aprobada') {
      throw new Error('Solo se cancelan órdenes que aún no recibieron mercadería');
    }
    orden.estado = 'cancelada';
    return structuredClone(orden);
  },

  /** Cada línea recibida SUMA STOCK y deja su entrada en el Kardex (referencia = la orden). */
  async registrarRecepcion(input: RecepcionInput): Promise<RecepcionCompra> {
    await delay(500);
    const orden = findOrden(input.ordenId);
    if (orden.estado !== 'aprobada' && orden.estado !== 'recibida_parcial') {
      throw new Error('La orden no está lista para recibir mercadería');
    }
    const almacen = db.almacenes.find((a) => a.id === input.almacenId);
    if (!almacen || almacen.estado !== 'activo') throw new Error('Selecciona un almacén activo');

    const lineas = input.lineas.filter((l) => l.cantidad > 0);
    if (lineas.length === 0) throw new Error('Indica al menos una cantidad recibida');

    // Validar todo antes de tocar el stock
    const vistos = new Set<string>();
    for (const l of lineas) {
      const linea = orden.lineas.find((x) => x.productoId === l.productoId);
      if (!linea) throw new Error('Un producto no pertenece a la orden');
      if (vistos.has(l.productoId)) throw new Error('Producto repetido en la recepción');
      vistos.add(l.productoId);
      if (l.cantidad > pendienteLinea(linea) + 0.0005) {
        throw new Error(`Recibes más de lo pendiente de "${nombreProducto(l.productoId)}"`);
      }
    }

    const fecha = todayISO();
    const referencia = refOrden(orden);
    for (const l of lineas) {
      aplicarMovimiento({
        productoId: l.productoId,
        almacenId: almacen.id,
        tipo: 'entrada',
        cantidad: l.cantidad,
        referencia,
        fecha,
      });
      const linea = orden.lineas.find((x) => x.productoId === l.productoId);
      if (linea) linea.cantidadRecibida = roundQty(linea.cantidadRecibida + l.cantidad);
    }
    orden.estado = orden.lineas.every((l) => pendienteLinea(l) <= 0) ? 'recibida' : 'recibida_parcial';

    const recepcion: RecepcionCompra = {
      id: generateId('rc'),
      codigo: `RC-${7000 + db.recepciones.length + 1}`,
      ordenId: orden.id,
      fecha,
      almacenId: almacen.id,
      lineas: lineas.map((l) => ({ productoId: l.productoId, cantidad: l.cantidad })),
    };
    db.recepciones.push(recepcion);
    return structuredClone(recepcion);
  },

  /** Registrar la factura GENERA la cuenta por pagar en Finanzas (vence según el plazo del proveedor). */
  async registrarFactura(input: FacturaInput): Promise<FacturaCompra> {
    await delay(500);
    const orden = findOrden(input.ordenId);
    if (orden.estado !== 'recibida') throw new Error('Solo se factura una orden recibida por completo');
    if (db.facturas.some((f) => f.ordenId === orden.id)) throw new Error('Esta orden ya tiene factura');

    const codigo = input.codigo.trim().toUpperCase();
    if (!FACTURA_REGEX.test(codigo)) throw new Error('Formato inválido. Ejemplo: F005-4410');
    if (!input.fecha) throw new Error('Indica la fecha de la factura');
    if (db.facturas.some((f) => f.proveedorId === orden.proveedorId && f.codigo === codigo)) {
      throw new Error('Ya registraste ese comprobante para este proveedor');
    }

    const proveedor = db.proveedores.find((p) => p.id === orden.proveedorId);
    if (!proveedor) throw new Error('Proveedor no encontrado');

    const monto = totalOrden(orden);
    const facturaId = generateId('fc');
    const vencimiento = addDays(input.fecha, proveedor.plazoPagoDias);

    const cuenta = registrarCuenta({
      tipo: 'pagar',
      contraparteId: proveedor.id,
      contraparte: proveedor.razonSocial,
      documento: codigo,
      documentoId: facturaId,
      origen: refOrden(orden),
      emision: input.fecha,
      vencimiento,
      monto,
    });

    const factura: FacturaCompra = {
      id: facturaId,
      codigo,
      ordenId: orden.id,
      proveedorId: proveedor.id,
      fecha: input.fecha,
      vencimiento,
      monto,
      cuentaId: cuenta.id,
    };
    db.facturas.push(factura);
    return structuredClone(factura);
  },
};