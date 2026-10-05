import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button, Dialog, Input, Select } from '@/components/ui';
import type { OrdenCompra, RecepcionInput } from '@/types/compras';
import type { Almacen, Producto } from '@/types/inventario';
import { pendienteLinea } from '@/utils/compras';

interface Props {
  orden: OrdenCompra | null;
  almacenes: readonly Almacen[];
  productoPorId: Map<string, Producto>;
  onClose: () => void;
  onSubmit: (input: RecepcionInput) => Promise<void>;
}

const FORM_ID = 'recepcion-form';

export function RecepcionDialog({ orden, almacenes, productoPorId, onClose, onSubmit }: Props) {
  const [almacenId, setAlmacenId] = useState('');
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ordenId = orden?.id;

  // Al abrir una orden, sugiere recibir todo lo pendiente
  useEffect(() => {
    if (!orden) return;
    const inicial: Record<string, string> = {};
    for (const l of orden.lineas) inicial[l.productoId] = String(pendienteLinea(l));
    setCantidades(inicial);
    setAlmacenId('');
    setError(null);
    setSubmitError(null);
  }, [ordenId]); // eslint-disable-line react-hooks/exhaustive-deps

  const almacenOptions = useMemo(
    () => almacenes.filter((a) => a.estado === 'activo').map((a) => ({ value: a.id, label: a.nombre })),
    [almacenes],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!orden) return;

    if (!almacenId) return setError('Selecciona el almacén que recibe la mercadería');

    const lineas: RecepcionInput['lineas'] = [];
    for (const l of orden.lineas) {
      const cantidad = Number(cantidades[l.productoId] ?? 0);
      const nombre = productoPorId.get(l.productoId)?.nombre ?? l.productoId;
      if (!(cantidad >= 0)) return setError(`Cantidad inválida en "${nombre}"`);
      if (cantidad > pendienteLinea(l) + 0.0005)
        return setError(`"${nombre}": solo quedan ${pendienteLinea(l)} por recibir`);
      if (cantidad > 0) lineas.push({ productoId: l.productoId, cantidad });
    }
    if (lineas.length === 0) return setError('Indica al menos una cantidad recibida');

    setError(null);
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({ ordenId: orden.id, almacenId, lineas });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo registrar la recepción');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={orden !== null}
      onClose={onClose}
      closeOnOverlayClick={false}
      size="lg"
      title="Recepción de mercadería"
      description={orden ? `Orden ${orden.codigo}. Lo recibido suma stock y queda en el Kardex.` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button type="submit" form={FORM_ID} isLoading={submitting}>Confirmar recepción</Button>
        </>
      }
    >
      {orden && (
        <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Select label="Almacén que recibe" required placeholder="Selecciona…" options={almacenOptions} value={almacenId} onChange={(e) => setAlmacenId(e.target.value)} />

          <ul className="divide-y divide-border rounded-md border border-border">
            {orden.lineas.map((l) => {
              const producto = productoPorId.get(l.productoId);
              const pendiente = pendienteLinea(l);
              return (
                <li key={l.productoId} className="grid items-center gap-3 p-3 sm:grid-cols-[1fr_140px]">
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{producto?.nombre ?? l.productoId}</p>
                    <p className="text-xs text-muted-foreground">
                      Pedido {l.cantidad} · recibido {l.cantidadRecibida} · pendiente {pendiente} {producto?.unidad}
                    </p>
                  </div>
                  <Input
                    aria-label={`Cantidad recibida de ${producto?.nombre ?? l.productoId}`}
                    type="number"
                    min="0"
                    step="any"
                    disabled={pendiente <= 0}
                    value={cantidades[l.productoId] ?? ''}
                    onChange={(e) => setCantidades((prev) => ({ ...prev, [l.productoId]: e.target.value }))}
                  />
                </li>
              );
            })}
          </ul>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
        </form>
      )}
    </Dialog>
  );
}