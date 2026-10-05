import { useCallback, useEffect, useState } from 'react';
import { bancoService } from '@/services/bancoService';
import type { CuentaBancaria, MovimientoBancario } from '@/types/finanzas';

export function useBancos() {
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoBancario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bancoService.getAll();
      setCuentas(data.cuentas);
      setMovimientos(data.movimientos);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los bancos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const conciliar = async (id: string) => {
    const actualizado = await bancoService.conciliar(id);
    setMovimientos((prev) => prev.map((m) => (m.id === id ? actualizado : m)));
  };

  return { cuentas, movimientos, isLoading, error, reload: load, conciliar };
}