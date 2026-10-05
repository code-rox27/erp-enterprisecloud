import { useEffect, useState, type FormEvent } from 'react';
import { Button, Dialog, Input, Select } from '@/components/ui';
import { UNIDADES, type ProductoInput, type UnidadMedida } from '@/types/inventario';

interface Props {
  open: boolean;
  categorias: readonly string[];
  onClose: () => void;
  onSubmit: (input: ProductoInput) => Promise<void>;
}

interface FormState {
  sku: string;
  nombre: string;
  categoria: string;
  unidad: UnidadMedida;
  precioCompra: string;
  precioVenta: string;
  stockMinimo: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  sku: '',
  nombre: '',
  categoria: '',
  unidad: 'UND',
  precioCompra: '',
  precioVenta: '',
  stockMinimo: '0',
};

const UNIDAD_OPTIONS = UNIDADES.map((u) => ({ value: u, label: u }));
const FORM_ID = 'producto-form';
const num = (s: string): number => (s.trim() === '' ? NaN : Number(s));

export function ProductoFormDialog({ open, categorias, onClose, onSubmit }: Props) {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found: Errors = {};
    if (values.sku.trim().length < 3) found.sku = 'Mínimo 3 caracteres';
    if (values.nombre.trim().length < 3) found.nombre = 'Ingresa el nombre';
    if (values.categoria.trim().length < 2) found.categoria = 'Indica la categoría';
    if (!(num(values.precioCompra) >= 0)) found.precioCompra = 'Precio inválido';
    if (!(num(values.precioVenta) >= 0)) found.precioVenta = 'Precio inválido';
    if (!(num(values.stockMinimo) >= 0)) found.stockMinimo = 'Valor inválido';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        sku: values.sku,
        nombre: values.nombre,
        categoria: values.categoria,
        unidad: values.unidad,
        precioCompra: num(values.precioCompra),
        precioVenta: num(values.precioVenta),
        stockMinimo: num(values.stockMinimo),
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo guardar');
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
      title="Nuevo producto"
      description="El stock inicial ingresa por una recepción de compra o un ajuste de inventario."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button type="submit" form={FORM_ID} isLoading={submitting}>Registrar</Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="SKU" required value={values.sku} onChange={(e) => set('sku', e.target.value)} error={errors.sku} />
        <Select label="Unidad" options={UNIDAD_OPTIONS} value={values.unidad} onChange={(e) => set('unidad', e.target.value as UnidadMedida)} />
        <div className="sm:col-span-2">
          <Input label="Nombre" required value={values.nombre} onChange={(e) => set('nombre', e.target.value)} error={errors.nombre} />
        </div>
        <div className="sm:col-span-2">
          <Input label="Categoría" required list="categorias-inventario" value={values.categoria} onChange={(e) => set('categoria', e.target.value)} error={errors.categoria} />
          <datalist id="categorias-inventario">
            {categorias.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <Input label="Precio de compra (S/)" type="number" min="0" step="0.01" required value={values.precioCompra} onChange={(e) => set('precioCompra', e.target.value)} error={errors.precioCompra} />
        <Input label="Precio de venta (S/)" type="number" min="0" step="0.01" required value={values.precioVenta} onChange={(e) => set('precioVenta', e.target.value)} error={errors.precioVenta} />
        <Input label="Stock mínimo" type="number" min="0" step="any" value={values.stockMinimo} onChange={(e) => set('stockMinimo', e.target.value)} error={errors.stockMinimo} hint="Debajo de este nivel se marca como stock bajo" />
        {submitError && (
          <p role="alert" className="text-sm text-destructive sm:col-span-2">{submitError}</p>
        )}
      </form>
    </Dialog>
  );
}