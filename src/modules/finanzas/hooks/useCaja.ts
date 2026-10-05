import { useCallback, useEffect, useMemo, useState } from 'react';
import { cajaService } from '@/services/cajaService';
import type {
  ArqueoCaja,
  ArqueoInput,
  CajaDelDia,
  MovimientoCajaInput,
} from '@/types/finanzas';
import { resumenCaja } from '@/utils/finanzas';

export function useCaja() {
  const [caja, setCaja] = useState<CajaDelDia | null>(null);
  const [arqueos, setArqueos] = useState<ArqueoCaja[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dia, historial] = await Promise.all([
        cajaService.getDelDia(),
        cajaService.listArqueos(),
      ]);
      setCaja(dia);
      setArqueos(historial);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la caja');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resumen = useMemo(
    () => (caja ? resumenCaja(caja.saldoInicial, caja.movimientos) : null),
    [caja],
  );

  const addMovimiento = async (input: MovimientoCajaInput) => {
    const nuevo = await cajaService.addMovimiento(input);
    setCaja((prev) => (prev ? { ...prev, movimientos: [...prev.movimientos, nuevo] } : prev));
  };

  const registrarArqueo = async (input: ArqueoInput) => {
    const nuevo = await cajaService.registrarArqueo(input);
    setArqueos((prev) => [nuevo, ...prev]);
  };

  return { caja, arqueos, resumen, isLoading, error, reload: load, addMovimiento, registrarArqueo };
}