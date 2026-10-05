import { useCallback, useEffect, useMemo, useState } from 'react';
import { inventarioService } from '@/services/inventarioService';
import type {
  AjusteInput,
  Almacen,
  InventarioSnapshot,
  Producto,
  ProductoInput,
  TransferenciaInput,
} from '@/types/inventario';
import { productosConStockBajo, stockTotalPorProducto, valorInventario } from '@/utils/inventario';

const EMPTY: InventarioSnapshot = {
  productos: [],
  almacenes: [],
  existencias: [],
  kardex: [],
  transferencias: [],
};

export function useInventario() {
  const [data, setData] = useState<InventarioSnapshot>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await inventarioService.getSnapshot());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el inventario');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Una operación toca varias colecciones (existencias + kardex + transferencias):
  // tras cada mutación se vuelve a leer todo para mantener la vista coherente.
  const mutate = async (action: () => Promise<unknown>): Promise<void> => {
    await action();
    setData(await inventarioService.getSnapshot());
  };

  const stockTotal = useMemo(() => stockTotalPorProducto(data.existencias), [data.existencias]);
  const stockBajo = useMemo(
    () => productosConStockBajo(data.productos, stockTotal),
    [data.productos, stockTotal],
  );
  const valorTotal = useMemo(
    () => valorInventario(data.productos, stockTotal),
    [data.productos, stockTotal],
  );
  const productoPorId = useMemo(
    () => new Map<string, Producto>(data.productos.map((p) => [p.id, p])),
    [data.productos],
  );
  const almacenPorId = useMemo(
    () => new Map<string, Almacen>(data.almacenes.map((a) => [a.id, a])),
    [data.almacenes],
  );

  return {
    ...data,
    stockTotal,
    stockBajo,
    valorTotal,
    productoPorId,
    almacenPorId,
    isLoading,
    error,
    reload: load,
    // Relanzan el error para que cada diálogo lo muestre
    crearProducto: (input: ProductoInput) => mutate(() => inventarioService.crearProducto(input)),
    registrarAjuste: (input: AjusteInput) => mutate(() => inventarioService.registrarAjuste(input)),
    crearTransferencia: (input: TransferenciaInput) =>
      mutate(() => inventarioService.crearTransferencia(input)),
    avanzarTransferencia: (id: string) => mutate(() => inventarioService.avanzarTransferencia(id)),
    cancelarTransferencia: (id: string) => mutate(() => inventarioService.cancelarTransferencia(id)),
  };
}