import type { EntidadRef } from '@/types/comun';
import type {
  DevolucionCompra,
  FacturaCompra,
  OrdenCompra,
  RecepcionCompra,
  SolicitudCompra,
} from '@/types/compras';
import type {
  ArqueoCaja,
  Cuenta,
  CuentaBancaria,
  MovimientoBancario,
  MovimientoCaja,
} from '@/types/finanzas';
import type {
  Almacen,
  Existencia,
  MovimientoKardex,
  Producto,
  Transferencia,
} from '@/types/inventario';
import type { Proveedor } from '@/types/proveedor';
import { addDays, todayISO } from '@/utils/dates';

/**
 * "Base de datos" única en memoria. TODOS los servicios mock leen y escriben aquí,
 * así Compras, Inventario y Finanzas siempre ven los mismos datos.
 */
interface MockDb {
  // Inventario
  productos: Producto[];
  almacenes: Almacen[];
  existencias: Existencia[];
  kardex: MovimientoKardex[];
  transferencias: Transferencia[];
  // Proveedores y compras
  proveedores: Proveedor[];
  ordenes: OrdenCompra[];
  recepciones: RecepcionCompra[];
  facturas: FacturaCompra[];
  solicitudes: SolicitudCompra[];
  devoluciones: DevolucionCompra[];
  // Finanzas
  cuentas: Cuenta[];
  cajaSaldoInicial: number;
  movimientosCaja: MovimientoCaja[];
  arqueos: ArqueoCaja[];
  cuentasBancarias: CuentaBancaria[];
  movimientosBancarios: MovimientoBancario[];
}

function createSeed(): MockDb {
  const hoy = todayISO();
  const d = (n: number): string => addDays(hoy, n);

  const oc1: EntidadRef = { tipo: 'compra', id: 'oc-001', codigo: 'OC-2026-001' };
  const oc2: EntidadRef = { tipo: 'compra', id: 'oc-002', codigo: 'OC-2026-002' };
  const vt: EntidadRef = { tipo: 'venta', id: 'vt-014', codigo: 'VT-00014' };
  const aj: EntidadRef = { tipo: 'ajuste', id: 'aj-0303', codigo: 'AJ-0303' };
  const tr1: EntidadRef = { tipo: 'transferencia', id: 'tr-1201', codigo: 'TR-1201' };
  const tr2: EntidadRef = { tipo: 'transferencia', id: 'tr-1202', codigo: 'TR-1202' };

  const venta = (n: number, codigo: string): EntidadRef => ({ tipo: 'venta', id: `vt-${n}`, codigo });

  return {
    // ───────────── Inventario ─────────────
    productos: [
      { id: 'prod-001', sku: 'MAT-001', nombre: 'Cemento Tipo I', categoria: 'Materiales', unidad: 'CJA', precioCompra: 31.5, precioVenta: 42.2, stockMinimo: 120, estado: 'activo' },
      { id: 'prod-002', sku: 'MAT-002', nombre: 'Malla de acero 10mm', categoria: 'Metales', unidad: 'UND', precioCompra: 18.2, precioVenta: 23.9, stockMinimo: 80, estado: 'activo' },
      { id: 'prod-003', sku: 'ELE-010', nombre: 'Cable eléctrico 3x2.5', categoria: 'Eléctricos', unidad: 'KG', precioCompra: 14.8, precioVenta: 18.6, stockMinimo: 50, estado: 'activo' },
      { id: 'prod-004', sku: 'OFI-101', nombre: 'Estación de trabajo', categoria: 'Oficina', unidad: 'UND', precioCompra: 980, precioVenta: 1240, stockMinimo: 6, estado: 'inactivo' },
    ],

    almacenes: [
      { id: 'alm-001', codigo: 'ALM-CENTRAL', nombre: 'Almacén Central', direccion: 'Av. Argentina 1850, Callao', responsable: 'Alan Pérez', estado: 'activo' },
      { id: 'alm-002', codigo: 'ALM-NORTE', nombre: 'Almacén Norte', direccion: 'Av. Túpac Amaru 3200, Independencia', responsable: 'Rosa Medina', estado: 'activo' },
      { id: 'alm-003', codigo: 'ALM-TRANS', nombre: 'Almacén de Tránsito', direccion: 'Panamericana Sur Km 18, VES', responsable: 'Jorge Rivas', estado: 'inactivo' },
    ],

    // La existencia = último saldo de cada par producto-almacén del Kardex
    existencias: [
      { productoId: 'prod-001', almacenId: 'alm-001', cantidad: 200 },
      { productoId: 'prod-001', almacenId: 'alm-002', cantidad: 120 },
      { productoId: 'prod-002', almacenId: 'alm-001', cantidad: 94 },
      { productoId: 'prod-002', almacenId: 'alm-002', cantidad: 60 },
      { productoId: 'prod-003', almacenId: 'alm-001', cantidad: 30 },
      { productoId: 'prod-003', almacenId: 'alm-002', cantidad: 12 },
      { productoId: 'prod-004', almacenId: 'alm-001', cantidad: 18 },
    ],

    kardex: [
      { id: 'kdx-001', fecha: d(-12), productoId: 'prod-001', almacenId: 'alm-001', tipo: 'entrada', cantidad: 260, saldo: 260, referencia: oc1 },
      { id: 'kdx-002', fecha: d(-12), productoId: 'prod-002', almacenId: 'alm-001', tipo: 'entrada', cantidad: 109, saldo: 109, referencia: oc1 },
      { id: 'kdx-003', fecha: d(-12), productoId: 'prod-003', almacenId: 'alm-001', tipo: 'entrada', cantidad: 60, saldo: 60, referencia: oc1 },
      { id: 'kdx-004', fecha: d(-12), productoId: 'prod-004', almacenId: 'alm-001', tipo: 'entrada', cantidad: 18, saldo: 18, referencia: oc1 },
      { id: 'kdx-005', fecha: d(-3), productoId: 'prod-001', almacenId: 'alm-002', tipo: 'entrada', cantidad: 120, saldo: 120, referencia: oc2 },
      { id: 'kdx-006', fecha: d(-3), productoId: 'prod-002', almacenId: 'alm-002', tipo: 'entrada', cantidad: 45, saldo: 45, referencia: oc2 },
      { id: 'kdx-007', fecha: d(-3), productoId: 'prod-003', almacenId: 'alm-002', tipo: 'entrada', cantidad: 12, saldo: 12, referencia: oc2 },
      { id: 'kdx-008', fecha: d(-2), productoId: 'prod-001', almacenId: 'alm-001', tipo: 'salida', cantidad: 60, saldo: 200, referencia: vt },
      { id: 'kdx-009', fecha: d(-1), productoId: 'prod-003', almacenId: 'alm-001', tipo: 'ajuste_negativo', cantidad: 10, saldo: 50, referencia: aj, observacion: 'Merma por deterioro' },
      { id: 'kdx-010', fecha: d(-1), productoId: 'prod-002', almacenId: 'alm-001', tipo: 'transferencia_salida', cantidad: 15, saldo: 94, referencia: tr1 },
      { id: 'kdx-011', fecha: d(-1), productoId: 'prod-002', almacenId: 'alm-002', tipo: 'transferencia_entrada', cantidad: 15, saldo: 60, referencia: tr1 },
      { id: 'kdx-012', fecha: d(0), productoId: 'prod-003', almacenId: 'alm-001', tipo: 'transferencia_salida', cantidad: 20, saldo: 30, referencia: tr2 },
    ],

    transferencias: [
      { id: 'tr-1201', codigo: 'TR-1201', origenId: 'alm-001', destinoId: 'alm-002', productoId: 'prod-002', cantidad: 15, fecha: d(-1), estado: 'completada' },
      { id: 'tr-1202', codigo: 'TR-1202', origenId: 'alm-001', destinoId: 'alm-002', productoId: 'prod-003', cantidad: 20, fecha: d(0), estado: 'en_transito' },
      { id: 'tr-1203', codigo: 'TR-1203', origenId: 'alm-002', destinoId: 'alm-001', productoId: 'prod-001', cantidad: 30, fecha: d(1), estado: 'programada' },
    ],

    // ───────────── Proveedores y compras ─────────────
    proveedores: [
      {
        id: 'prv-001', ruc: '20100070970', razonSocial: 'Distribuidora Andina S.A.C.', categoria: 'Materia prima',
        email: 'ventas@andina.pe', telefono: '014567890', direccion: 'Av. Argentina 1850, Callao',
        estado: 'activo', creadoEn: '2026-03-12T10:00:00.000Z', lineaCredito: 50000, plazoPagoDias: 10,
        contactos: [{ id: 'c-001', nombre: 'Luis Quispe', cargo: 'Ejecutivo de cuentas', email: 'lquispe@andina.pe', telefono: '987654321', principal: true }],
      },
      {
        id: 'prv-002', ruc: '20512345678', razonSocial: 'Insumos Industriales del Perú S.R.L.', categoria: 'Insumos',
        email: 'contacto@insumosperu.com', telefono: '012345678', direccion: 'Jr. Los Artesanos 450, Ate',
        estado: 'activo', creadoEn: '2026-04-02T15:30:00.000Z', lineaCredito: 20000, plazoPagoDias: 30,
        contactos: [
          { id: 'c-002', nombre: 'María Torres', cargo: 'Gerente comercial', email: 'mtorres@insumosperu.com', telefono: '999111222', principal: true },
          { id: 'c-003', nombre: 'Jorge Rivas', cargo: 'Soporte', email: 'jrivas@insumosperu.com', telefono: '999333444', principal: false },
        ],
      },
      {
        id: 'prv-003', ruc: '20601234567', razonSocial: 'TecnoSoluciones Lima E.I.R.L.', categoria: 'Tecnología',
        email: 'info@tecnolima.pe', telefono: '016543210', direccion: 'Av. Javier Prado Este 2310, San Borja',
        estado: 'activo', creadoEn: '2026-05-20T09:15:00.000Z', lineaCredito: 15000, plazoPagoDias: 15,
        contactos: [],
      },
      {
        id: 'prv-004', ruc: '20456789012', razonSocial: 'Transportes Rápidos del Sur S.A.', categoria: 'Logística',
        email: 'operaciones@trsur.pe', telefono: '014440000', direccion: 'Panamericana Sur Km 18, Villa El Salvador',
        estado: 'inactivo', creadoEn: '2026-01-08T08:00:00.000Z', lineaCredito: 5000, plazoPagoDias: 0,
        contactos: [{ id: 'c-004', nombre: 'Rosa Medina', cargo: 'Jefa de operaciones', email: 'rmedina@trsur.pe', telefono: '988777666', principal: true }],
      },
    ],

    ordenes: [
      {
        id: 'oc-001', codigo: 'OC-2026-001', proveedorId: 'prv-001', fecha: d(-14), prioridad: 'alta', estado: 'recibida',
        lineas: [
          { productoId: 'prod-001', cantidad: 260, costoUnitario: 31.5, cantidadRecibida: 260 },
          { productoId: 'prod-002', cantidad: 109, costoUnitario: 18.2, cantidadRecibida: 109 },
          { productoId: 'prod-003', cantidad: 60, costoUnitario: 14.8, cantidadRecibida: 60 },
          { productoId: 'prod-004', cantidad: 18, costoUnitario: 980, cantidadRecibida: 18 },
        ],
      },
      {
        id: 'oc-002', codigo: 'OC-2026-002', proveedorId: 'prv-002', fecha: d(-5), prioridad: 'media', estado: 'recibida',
        lineas: [
          { productoId: 'prod-001', cantidad: 120, costoUnitario: 31.5, cantidadRecibida: 120 },
          { productoId: 'prod-002', cantidad: 45, costoUnitario: 18.2, cantidadRecibida: 45 },
          { productoId: 'prod-003', cantidad: 12, costoUnitario: 14.8, cantidadRecibida: 12 },
        ],
      },
      {
        id: 'oc-003', codigo: 'OC-2026-003', proveedorId: 'prv-001', fecha: d(-2), prioridad: 'baja', estado: 'pendiente',
        lineas: [
          { productoId: 'prod-003', cantidad: 80, costoUnitario: 14.8, cantidadRecibida: 0 },
          { productoId: 'prod-002', cantidad: 100, costoUnitario: 18.2, cantidadRecibida: 0 },
        ],
      },
      {
        id: 'oc-004', codigo: 'OC-2026-004', proveedorId: 'prv-002', fecha: d(-1), prioridad: 'alta', estado: 'aprobada',
        lineas: [
          { productoId: 'prod-002', cantidad: 125, costoUnitario: 18.2, cantidadRecibida: 0 },
          { productoId: 'prod-001', cantidad: 200, costoUnitario: 31.5, cantidadRecibida: 0 },
        ],
      },
    ],

    recepciones: [
      {
        id: 'rc-001', codigo: 'RC-7001', ordenId: 'oc-001', fecha: d(-12), almacenId: 'alm-001',
        lineas: [
          { productoId: 'prod-001', cantidad: 260 },
          { productoId: 'prod-002', cantidad: 109 },
          { productoId: 'prod-003', cantidad: 60 },
          { productoId: 'prod-004', cantidad: 18 },
        ],
      },
      {
        id: 'rc-002', codigo: 'RC-7002', ordenId: 'oc-002', fecha: d(-3), almacenId: 'alm-002',
        lineas: [
          { productoId: 'prod-001', cantidad: 120 },
          { productoId: 'prod-002', cantidad: 45 },
          { productoId: 'prod-003', cantidad: 12 },
        ],
      },
    ],

    facturas: [
      { id: 'fc-001', codigo: 'F005-4410', ordenId: 'oc-001', proveedorId: 'prv-001', fecha: d(-12), vencimiento: d(-2), monto: 28701.8, cuentaId: 'cxp-001' },
      { id: 'fc-002', codigo: 'F002-1187', ordenId: 'oc-002', proveedorId: 'prv-002', fecha: d(-3), vencimiento: d(27), monto: 4776.6, cuentaId: 'cxp-002' },
    ],

    solicitudes: [
      { id: 'sc-001', codigo: 'SC-1001', descripcion: 'Compra de materiales para obra A', proveedorId: 'prv-001', fecha: d(-3), monto: 2275, prioridad: 'alta', estado: 'aprobada' },
      { id: 'sc-002', codigo: 'SC-1002', descripcion: 'Repuestos de línea de montaje', proveedorId: 'prv-002', fecha: d(-3), monto: 8400, prioridad: 'media', estado: 'pendiente' },
      { id: 'sc-003', codigo: 'SC-1003', descripcion: 'Equipo de oficina para área de logística', proveedorId: 'prv-003', fecha: d(-4), monto: 5450, prioridad: 'baja', estado: 'rechazada' },
    ],

    devoluciones: [
      { id: 'dv-001', codigo: 'DV-8001', ordenId: 'oc-001', proveedorId: 'prv-001', productoId: 'prod-002', motivo: 'Material con daño de empaque', monto: 340, estado: 'solicitada' },
      { id: 'dv-002', codigo: 'DV-8002', ordenId: 'oc-002', proveedorId: 'prv-002', productoId: 'prod-001', motivo: 'Entrega incompleta', monto: 760, estado: 'procesada' },
    ],

    // ───────────── Finanzas ─────────────
    cuentas: [
      // Por cobrar (origen: ventas, módulo de otro integrante)
      { id: 'cxc-001', tipo: 'cobrar', contraparteId: 'cli-001', contraparte: 'Comercial Los Andes S.A.C.', documento: 'F001-00231', origen: venta(231, 'F001-00231'), emision: d(-40), vencimiento: d(-10), monto: 5900, saldo: 5180, pagos: [{ id: 'pg-005', fecha: d(0), monto: 720, medio: 'efectivo', referencia: '', movimientoId: 'mc-003' }] },
      { id: 'cxc-002', tipo: 'cobrar', contraparteId: 'cli-002', contraparte: 'Distribuidora Pacífico S.R.L.', documento: 'F001-00245', origen: venta(245, 'F001-00245'), emision: d(-20), vencimiento: d(10), monto: 12400, saldo: 6200, pagos: [{ id: 'pg-001', fecha: d(-12), monto: 6200, medio: 'transferencia', referencia: 'OP-884213', cuentaBancariaId: 'bco-001', movimientoId: 'mb-001' }] },
      { id: 'cxc-003', tipo: 'cobrar', contraparteId: 'cli-003', contraparte: 'Inversiones Delta E.I.R.L.', documento: 'F001-00252', origen: venta(252, 'F001-00252'), emision: d(-8), vencimiento: d(22), monto: 3480, saldo: 3480, pagos: [] },
      { id: 'cxc-004', tipo: 'cobrar', contraparteId: 'cli-004', contraparte: 'Ferretería El Constructor', documento: 'F001-00219', origen: venta(219, 'F001-00219'), emision: d(-60), vencimiento: d(-30), monto: 2150, saldo: 0, pagos: [{ id: 'pg-002', fecha: d(-32), monto: 2150, medio: 'efectivo', referencia: '' }] },
      { id: 'cxc-005', tipo: 'cobrar', contraparteId: 'cli-005', contraparte: 'Minera Santa Rosa S.A.', documento: 'F001-00238', origen: venta(238, 'F001-00238'), emision: d(-25), vencimiento: d(-3), monto: 18750, saldo: 9750, pagos: [{ id: 'pg-006', fecha: d(-4), monto: 9000, medio: 'transferencia', referencia: 'OP-902331', cuentaBancariaId: 'bco-001', movimientoId: 'mb-004' }] },
      { id: 'cxc-006', tipo: 'cobrar', contraparteId: 'cli-006', contraparte: 'Corporación Lima Norte', documento: 'F001-00258', origen: venta(258, 'F001-00258'), emision: d(-2), vencimiento: d(28), monto: 7320, saldo: 7320, pagos: [] },

      // Por pagar (origen: compras; vienen de las facturas de arriba)
      { id: 'cxp-001', tipo: 'pagar', contraparteId: 'prv-001', contraparte: 'Distribuidora Andina S.A.C.', documento: 'F005-4410', documentoId: 'fc-001', origen: oc1, emision: d(-12), vencimiento: d(-2), monto: 28701.8, saldo: 18701.8, pagos: [{ id: 'pg-003', fecha: d(-6), monto: 10000, medio: 'transferencia', referencia: 'OP-771902', cuentaBancariaId: 'bco-001', movimientoId: 'mb-002' }] },
      { id: 'cxp-002', tipo: 'pagar', contraparteId: 'prv-002', contraparte: 'Insumos Industriales del Perú S.R.L.', documento: 'F002-1187', documentoId: 'fc-002', origen: oc2, emision: d(-3), vencimiento: d(27), monto: 4776.6, saldo: 4776.6, pagos: [] },
    ],

    cajaSaldoInicial: 500,

    movimientosCaja: [
      { id: 'mc-001', fecha: hoy, hora: '08:42', tipo: 'ingreso', concepto: 'Venta al contado F001-00260', monto: 350 },
      { id: 'mc-002', fecha: hoy, hora: '10:15', tipo: 'egreso', concepto: 'Caja chica: útiles de oficina', monto: 85.5 },
      { id: 'mc-003', fecha: hoy, hora: '11:30', tipo: 'ingreso', concepto: 'Cobro F001-00231 · Comercial Los Andes S.A.C.', monto: 720, origenCuentaId: 'cxc-001' },
      { id: 'mc-004', fecha: hoy, hora: '12:05', tipo: 'egreso', concepto: 'Pasajes por reparto', monto: 40 },
    ],

    arqueos: [
      { id: 'aq-001', fecha: d(-1), hora: '18:10', responsable: 'Fiorella Finanzas', saldoEsperado: 1240.5, efectivoContado: 1240.5, diferencia: 0, conteo: { '200': 3, '100': 3, '50': 4, '20': 5, '10': 4, '0.5': 1 }, observaciones: '' },
      { id: 'aq-002', fecha: d(-2), hora: '18:02', responsable: 'Fiorella Finanzas', saldoEsperado: 980, efectivoContado: 970, diferencia: -10, conteo: { '200': 3, '100': 3, '50': 1, '20': 1 }, observaciones: 'Faltante por vuelto mal entregado.' },
    ],

    cuentasBancarias: [
      { id: 'bco-001', banco: 'BCP', alias: 'Cuenta corriente principal', numeroEnmascarado: '•••• 4821', moneda: 'PEN', saldoInicial: 25000 },
      { id: 'bco-002', banco: 'BBVA', alias: 'Cuenta de dólares', numeroEnmascarado: '•••• 7305', moneda: 'USD', saldoInicial: 4000 },
    ],

    movimientosBancarios: [
      { id: 'mb-001', cuentaId: 'bco-001', fecha: d(-12), descripcion: 'Cobro F001-00245 · Distribuidora Pacífico S.R.L.', referencia: 'OP-884213', tipo: 'abono', monto: 6200, conciliado: true, origenCuentaId: 'cxc-002' },
      { id: 'mb-002', cuentaId: 'bco-001', fecha: d(-6), descripcion: 'Pago F005-4410 · Distribuidora Andina S.A.C.', referencia: 'OP-771902', tipo: 'cargo', monto: 10000, conciliado: true, origenCuentaId: 'cxp-001' },
      { id: 'mb-003', cuentaId: 'bco-001', fecha: d(-6), descripcion: 'Comisión mantenimiento de cuenta', referencia: 'COM-0910', tipo: 'cargo', monto: 25, conciliado: false },
      { id: 'mb-004', cuentaId: 'bco-001', fecha: d(-4), descripcion: 'Cobro F001-00238 · Minera Santa Rosa S.A.', referencia: 'OP-902331', tipo: 'abono', monto: 9000, conciliado: false, origenCuentaId: 'cxc-005' },
      { id: 'mb-005', cuentaId: 'bco-001', fecha: d(-2), descripcion: 'Pago planilla quincenal', referencia: 'PLN-0930', tipo: 'cargo', monto: 11800, conciliado: false },
      { id: 'mb-006', cuentaId: 'bco-002', fecha: d(-10), descripcion: 'Pago proveedor del exterior', referencia: 'SW-55102', tipo: 'cargo', monto: 1500, conciliado: true },
      { id: 'mb-007', cuentaId: 'bco-002', fecha: d(-3), descripcion: 'Abono cliente exportación', referencia: 'SW-55877', tipo: 'abono', monto: 3200, conciliado: false },
    ],
  };
}

export const db: MockDb = createSeed();

/** Útil en pruebas manuales: vuelve a los datos iniciales. */
export function resetMockDb(): void {
  Object.assign(db, createSeed());
}