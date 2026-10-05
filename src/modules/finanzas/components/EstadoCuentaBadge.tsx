import { Badge, type BadgeVariant } from '@/components/ui';
import type { EstadoCuenta } from '@/types/finanzas';

const MAP: Record<EstadoCuenta, { label: string; variant: BadgeVariant }> = {
  pendiente: { label: 'Pendiente', variant: 'info' },
  parcial: { label: 'Pago parcial', variant: 'warning' },
  vencida: { label: 'Vencida', variant: 'danger' },
  pagada: { label: 'Pagada', variant: 'success' },
};

export function EstadoCuentaBadge({ estado }: { estado: EstadoCuenta }) {
  const { label, variant } = MAP[estado];
  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}