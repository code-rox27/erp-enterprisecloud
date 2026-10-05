import { useCallback, useEffect, useMemo, useState } from 'react';
import { compraService } from '@/services/compraService';
import { cuentaService } from '@/services/cuentaService';
import type {
  ComprasSnapshot,
  FacturaCompra,
  FacturaInput,
  OrdenCompra,
  OrdenInput,
  RecepcionInput,
} from '@/types/compras';
import type { Cuenta, PagoInput } from '@/types/finanzas';
import type { Almacen, Producto } from '@/types/inventario';
import type { Proveedor } from '@/types/proveedor';

const EMPTY: ComprasSnapshot = {
  ordenes: [],
  recepciones: [],
  facturas: [],
  solicitudes: [],
  devoluciones: [],
  proveedores: [],
  productos: [],
  almacenes: [],
  cuentas: [],
};

export function useCompras() {
  const [data, setData] = useState<ComprasSnapshot>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await compraService.getSnapshot());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las compras');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Una operación toca varias colecciones (stock, Kardex, cuentas…): se relee todo tras cada cambio
  const mutate = async (action: () => Promise<unknown>): Promise<void> => {
    await action();
    setData(await compraService.getSnapshot());
  };

  const proveedorPorId = useMemo(
    () => new Map<string, Proveedor>(data.proveedores.map((p) => [p.id, p])),
    [data.proveedores],
  );
  const productoPorId = useMemo(
    () => new Map<string, Producto>(data.productos.map((p) => [p.id, p])),
    [data.productos],
  );
  const almacenPorId = useMemo(
    () => new Map<string, Almacen>(data.almacenes.map((a) => [a.id, a])),
    [data.almacenes],
  );
  const ordenPorId = useMemo(
    () => new Map<string, OrdenCompra>(data.ordenes.map((o) => [o.id, o])),
    [data.ordenes],
  );
  const cuentaPorId = useMemo(
    () => new Map<string, Cuenta>(data.cuentas.map((c) => [c.id, c])),
    [data.cuentas],
  );
  const facturaPorOrden = useMemo(
    () => new Map<string, FacturaCompra>(data.facturas.map((f) => [f.ordenId, f])),
    [data.facturas],
  );

  return {
    ...data,
    proveedorPorId,
    productoPorId,
    almacenPorId,
    ordenPorId,
    cuentaPorId,
    facturaPorOrden,
    isLoading,
    error,
    reload: load,
    // Relanzan el error para que cada diálogo lo muestre
    crearOrden: (input: OrdenInput) => mutate(() => compraService.crearOrden(input)),
    aprobarOrden: (id: string) => mutate(() => compraService.resolverAprobacion(id, 'aprobada')),
    rechazarOrden: (id: string) => mutate(() => compraService.resolverAprobacion(id, 'rechazada')),
    cancelarOrden: (id: string) => mutate(() => compraService.cancelarOrden(id)),
    registrarRecepcion: (input: RecepcionInput) => mutate(() => compraService.registrarRecepcion(input)),
    registrarFactura: (input: FacturaInput) => mutate(() => compraService.registrarFactura(input)),
    registrarPago: (cuentaId: string, input: PagoInput) =>
      mutate(() => cuentaService.registrarPago(cuentaId, input)),
  };
}