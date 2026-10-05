import { useCallback, useEffect, useState } from 'react';
import { cuentaService } from '@/services/cuentaService';
import type { Cuenta, PagoInput, TipoCuenta } from '@/types/finanzas';

export function useCuentas(tipo: TipoCuenta) {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setCuentas(await cuentaService.list(tipo));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las cuentas');
    } finally {
      setIsLoading(false);
    }
  }, [tipo]);

  useEffect(() => {
    void load();
  }, [load]);

  // Relanza el error para que el formulario lo muestre
  const registrarPago = async (id: string, input: PagoInput) => {
    const actualizada = await cuentaService.registrarPago(id, input);
    setCuentas((prev) => prev.map((c) => (c.id === id ? actualizada : c)));
  };

  return { cuentas, isLoading, error, reload: load, registrarPago };
}