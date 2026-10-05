import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button, Dialog, Input, Select } from '@/components/ui';
import type { Almacen, Existencia, Producto, TransferenciaInput } from '@/types/inventario';
import { todayISO } from '@/utils/dates';
import { stockEn } from '@/utils/inventario';

interface Props {
  open: boolean;
  productos: readonly Producto[];
  almacenes: readonly Almacen[];
  existencias: readonly Existencia[];
  onClose: () => void;
  onSubmit: (input: TransferenciaInput) => Promise<void>;
}

interface FormState {
  productoId: string;
  origenId: string;
  destinoId: string;
  cantidad: string;
  fecha: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const FORM_ID = 'transferencia-form';
const empty = (): FormState => ({ productoId: '', origenId: '', destinoId: '', cantidad: '', fecha: todayISO() });

export function TransferenciaFormDialog({ open, productos, almacenes, existencias, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(empty());
    setErrors({});
    setSubmitError(null);
  }, [open]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const productoOptions = useMemo(
    () => productos.filter((p) => p.estado === 'activo').map((p) => ({ value: p.id, label: `${p.sku} · ${p.nombre}` })),
    [productos],
  );
  const almacenOptions = useMemo(
    () => almacenes.filter((a) => a.estado === 'activo').map((a) => ({ value: a.id, label: a.nombre })),
    [almacenes],
  );

  const producto = productos.find((p) => p.id === values.productoId);
  const disponible =
    values.productoId && values.origenId ? stockEn(existencias, values.productoId, values.origenId) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cantidad = Number(values.cantidad);
    const found: Errors = {};
    if (!values.productoId) found.productoId = 'Selecciona un producto';
    if (!values.origenId) found.origenId = 'Selecciona el origen';
    if (!values.destinoId) found.destinoId = 'Selecciona el destino';
    else if (values.destinoId === values.origenId) found.destinoId = 'Debe ser distinto al origen';
    if (!(cantidad > 0)) found.cantidad = 'Ingresa una cantidad mayor a cero';
    else if (disponible !== null && cantidad > disponible)
      found.cantidad = `Solo hay ${disponible} disponibles en el origen`;
    if (!values.fecha) found.fecha = 'Indica la fecha';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        productoId: values.productoId,
        origenId: values.origenId,
        destinoId: values.destinoId,
        cantidad,
        fecha: values.fecha,
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo registrar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      closeOnOverlayClick={false}
      size="lg"
      title="Nueva transferencia"
      description="Se crea programada. El stock se descuenta al despachar y se suma al confirmar la recepción."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button type="submit" form={FORM_ID} isLoading={submitting}>Programar</Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Select label="Producto" required placeholder="Selecciona…" options={productoOptions} value={values.productoId} onChange={(e) => set('productoId', e.target.value)} error={errors.productoId} />
        </div>
        <Select label="Origen" required placeholder="Selecciona…" options={almacenOptions} value={values.origenId} onChange={(e) => set('origenId', e.target.value)} error={errors.origenId} />
        <Select label="Destino" required placeholder="Selecciona…" options={almacenOptions} value={values.destinoId} onChange={(e) => set('destinoId', e.target.value)} error={errors.destinoId} />
        <Input
          label={`Cantidad${producto ? ` (${producto.unidad})` : ''}`}
          type="number"
          required
          min="0"
          step="any"
          value={values.cantidad}
          onChange={(e) => set('cantidad', e.target.value)}
          error={errors.cantidad}
          hint={disponible !== null ? `Disponible en origen: ${disponible}` : undefined}
        />
        <Input label="Fecha" type="date" required value={values.fecha} onChange={(e) => set('fecha', e.target.value)} error={errors.fecha} />
        {submitError && (
          <p role="alert" className="text-sm text-destructive sm:col-span-2">{submitError}</p>
        )}
      </form>
    </Dialog>
  );
}