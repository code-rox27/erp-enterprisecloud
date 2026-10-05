import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button, Dialog, Input, Select } from '@/components/ui';
import type { AjusteInput, Almacen, Existencia, Producto } from '@/types/inventario';
import { stockEn } from '@/utils/inventario';

interface Props {
  open: boolean;
  productos: readonly Producto[];
  almacenes: readonly Almacen[];
  existencias: readonly Existencia[];
  onClose: () => void;
  onSubmit: (input: AjusteInput) => Promise<void>;
}

interface FormState {
  productoId: string;
  almacenId: string;
  sentido: AjusteInput['sentido'];
  cantidad: string;
  motivo: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const SENTIDOS = [
  { value: 'negativo', label: 'Disminuir stock (merma, pérdida…)' },
  { value: 'positivo', label: 'Aumentar stock (sobrante, conteo…)' },
];

const FORM_ID = 'ajuste-form';
const EMPTY: FormState = { productoId: '', almacenId: '', sentido: 'negativo', cantidad: '', motivo: '' };

export function AjusteDialog({ open, productos, almacenes, existencias, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(EMPTY);
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

  const actual =
    values.productoId && values.almacenId ? stockEn(existencias, values.productoId, values.almacenId) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cantidad = Number(values.cantidad);
    const found: Errors = {};
    if (!values.productoId) found.productoId = 'Selecciona un producto';
    if (!values.almacenId) found.almacenId = 'Selecciona el almacén';
    if (!(cantidad > 0)) found.cantidad = 'Ingresa una cantidad mayor a cero';
    else if (values.sentido === 'negativo' && actual !== null && cantidad > actual)
      found.cantidad = `Solo hay ${actual} en este almacén`;
    if (values.motivo.trim().length < 3) found.motivo = 'Indica el motivo del ajuste';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        productoId: values.productoId,
        almacenId: values.almacenId,
        sentido: values.sentido,
        cantidad,
        motivo: values.motivo,
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo registrar el ajuste');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      closeOnOverlayClick={false}
      title="Registrar ajuste de inventario"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button type="submit" form={FORM_ID} isLoading={submitting}>Registrar ajuste</Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Select label="Producto" required placeholder="Selecciona…" options={productoOptions} value={values.productoId} onChange={(e) => set('productoId', e.target.value)} error={errors.productoId} />
        <Select label="Almacén" required placeholder="Selecciona…" options={almacenOptions} value={values.almacenId} onChange={(e) => set('almacenId', e.target.value)} error={errors.almacenId} />
        <Select label="Tipo de ajuste" options={SENTIDOS} value={values.sentido} onChange={(e) => set('sentido', e.target.value as AjusteInput['sentido'])} />
        <Input
          label="Cantidad"
          type="number"
          required
          min="0"
          step="any"
          value={values.cantidad}
          onChange={(e) => set('cantidad', e.target.value)}
          error={errors.cantidad}
          hint={actual !== null ? `Existencia actual: ${actual}` : undefined}
        />
        <Input label="Motivo" required value={values.motivo} onChange={(e) => set('motivo', e.target.value)} error={errors.motivo} />
        {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
      </form>
    </Dialog>
  );
}