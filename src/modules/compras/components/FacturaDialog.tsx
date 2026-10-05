import { useEffect, useState, type FormEvent } from 'react';
import { Button, Dialog, Input } from '@/components/ui';
import type { FacturaInput, OrdenCompra } from '@/types/compras';
import type { Proveedor } from '@/types/proveedor';
import { FACTURA_REGEX, totalOrden } from '@/utils/compras';
import { addDays, todayISO } from '@/utils/dates';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface Props {
  orden: OrdenCompra | null;
  proveedor: Proveedor | null;
  onClose: () => void;
  onSubmit: (input: FacturaInput) => Promise<void>;
}

const FORM_ID = 'factura-form';

export function FacturaDialog({ orden, proveedor, onClose, onSubmit }: Props) {
  const [codigo, setCodigo] = useState('');
  const [fecha, setFecha] = useState(todayISO());
  const [errors, setErrors] = useState<{ codigo?: string; fecha?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ordenId = orden?.id;

  useEffect(() => {
    if (!ordenId) return;
    setCodigo('');
    setFecha(todayISO());
    setErrors({});
    setSubmitError(null);
  }, [ordenId]);

  const plazo = proveedor?.plazoPagoDias ?? 0;
  const vencimiento = fecha ? addDays(fecha, plazo) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!orden) return;

    const found: typeof errors = {};
    if (!FACTURA_REGEX.test(codigo.trim().toUpperCase())) found.codigo = 'Formato inválido. Ejemplo: F005-4410';
    if (!fecha) found.fecha = 'Indica la fecha';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({ ordenId: orden.id, codigo, fecha });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo registrar la factura');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={orden !== null}
      onClose={onClose}
      closeOnOverlayClick={false}
      title="Registrar factura del proveedor"
      description={orden && proveedor ? `${orden.codigo} · ${proveedor.razonSocial}` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button type="submit" form={FORM_ID} isLoading={submitting}>Registrar factura</Button>
        </>
      }
    >
      {orden && (
        <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input label="N.º de factura" required placeholder="F005-4410" value={codigo} onChange={(e) => setCodigo(e.target.value)} error={errors.codigo} />
          <Input label="Fecha de emisión" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} error={errors.fecha} />

          <dl className="grid grid-cols-2 gap-4 rounded-md border border-border bg-background p-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Monto a pagar</dt>
              <dd className="font-medium text-foreground">{formatCurrency(totalOrden(orden))}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Vence {plazo === 0 ? '(contado)' : `(plazo ${plazo} días)`}
              </dt>
              <dd className="font-medium text-foreground">{vencimiento ? formatDate(vencimiento) : '—'}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">
            Al registrarla se crea la cuenta por pagar en Finanzas.
          </p>

          {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
        </form>
      )}
    </Dialog>
  );
}