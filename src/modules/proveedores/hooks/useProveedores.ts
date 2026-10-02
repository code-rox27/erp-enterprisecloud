import { useCallback, useEffect, useState } from 'react';
import { proveedorService } from '@/services/proveedorService';
import type { ContactoInput, Proveedor, ProveedorInput } from '@/types/proveedor';

export function useProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setProveedores(await proveedorService.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el directorio');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const replace = (p: Proveedor) =>
    setProveedores((prev) => prev.map((x) => (x.id === p.id ? p : x)));

  // Las acciones relanzan el error para que cada formulario lo muestre.
  const create = async (input: ProveedorInput) => {
    const nuevo = await proveedorService.create(input);
    setProveedores((prev) => [nuevo, ...prev]);
  };

  const update = async (id: string, input: ProveedorInput) =>
    replace(await proveedorService.update(id, input));

  const toggleEstado = async (p: Proveedor) =>
    replace(await proveedorService.setEstado(p.id, p.estado === 'activo' ? 'inactivo' : 'activo'));

  const addContacto = async (id: string, input: ContactoInput) =>
    replace(await proveedorService.addContacto(id, input));

  const removeContacto = async (id: string, contactoId: string) =>
    replace(await proveedorService.removeContacto(id, contactoId));

  return {
    proveedores,
    isLoading,
    error,
    reload: load,
    create,
    update,
    toggleEstado,
    addContacto,
    removeContacto,
  };
}