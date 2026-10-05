import { useState } from 'react';
import { Badge, Button, Table, type BadgeVariant, type TableColumn } from '@/components/ui';
import type { Almacen, EstadoTransferencia, Producto, Transferencia } from '@/types/inventario';
import { formatDate } from '@/utils/formatters';

interface Props {
  transferencias: readonly Transferencia[];
  productoPorId: Map<string, Producto>;
  almacenPorId: Map<string, Almacen>;
  isLoading: boolean;
  onAvanzar: (id: string) => Promise<void>;
  onCancelar: (id: string) => Promise<void>;
}

const ESTADOS: Record<EstadoTransferencia, { label: string; variant: BadgeVariant }> = {
  programada: { label: 'Programada', variant: 'neutral' },
  en_transito: { label: 'En tránsito', variant: 'warning' },
  completada: { label: 'Completada', variant: 'success' },
  cancelada: { label: 'Cancelada', variant: 'danger' },
};

export function TransferenciasTab({
  transferencias,
  productoPorId,
  almacenPorId,
  isLoading,
  onAvanzar,
  onCancelar,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (id: string, action: (id: string) => Promise<void>) => {
    setBusyId(id);
    setError(null);
    try {
      await action(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar la acción');
    } finally {
      setBusyId(null);
    }
  };

  const nombreAlmacen = (id: string) => almacenPorId.get(id)?.nombre ?? id;

  const columns: TableColumn<Transferencia>[] = [
    {
      key: 'codigo',
      header: 'Transferencia',
      cell: (t) => (
        <div>
          <p className="font-medium text-foreground">{t.codigo}</p>
          <p className="text-xs text-muted-foreground">{formatDate(t.fecha)}</p>
        </div>
      ),
    },
    { key: 'producto', header: 'Producto', cell: (t) => productoPorId.get(t.productoId)?.nombre ?? t.productoId },
    {
      key: 'ruta',
      header: 'Origen → Destino',
      cell: (t) => `${nombreAlmacen(t.origenId)} → ${nombreAlmacen(t.destinoId)}`,
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
      align: 'right',
      cell: (t) => `${t.cantidad} ${productoPorId.get(t.productoId)?.unidad ?? ''}`,
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (t) => <Badge variant={ESTADOS[t.estado].variant} dot>{ESTADOS[t.estado].label}</Badge>,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (t) => (
        <div className="flex justify-end gap-1">
          {t.estado === 'programada' && (
            <>
              <Button size="sm" variant="outline" isLoading={busyId === t.id} onClick={() => void run(t.id, onAvanzar)}>
                Despachar
              </Button>
              <Button size="sm" variant="ghost" disabled={busyId === t.id} onClick={() => void run(t.id, onCancelar)}>
                Cancelar
              </Button>
            </>
          )}
          {t.estado === 'en_transito' && (
            <Button size="sm" variant="outline" isLoading={busyId === t.id} onClick={() => void run(t.id, onAvanzar)}>
              Confirmar recepción
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Table<Transferencia>
        columns={columns}
        data={[...transferencias].reverse()}
        rowKey={(t) => t.id}
        isLoading={isLoading}
        emptyMessage="No hay transferencias registradas."
      />
    </div>
  );
}