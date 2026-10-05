import type { Moneda } from '@/types/finanzas';
import { parseISODate } from './dates';

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export function formatCurrency(value: number, currency: Moneda = 'PEN'): string {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(value);
}

export function formatDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}