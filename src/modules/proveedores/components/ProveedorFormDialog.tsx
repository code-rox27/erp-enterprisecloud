import { useEffect, useState, type FormEvent } from 'react';
import { Button, Dialog, Input, Select } from '@/components/ui';
import {
  CATEGORIAS_PROVEEDOR,
  type CategoriaProveedor,
  type Proveedor,
  type ProveedorInput,
} from '@/types/proveedor';
import { isValidEmail, isValidPhone, isValidRuc } from '@/utils/validators';

interface Props {
  open: boolean;
  /** null = modo registro; con valor = modo edición. */
  proveedor: Proveedor | null;
  onClose: () => void;
  onSubmit: (input: ProveedorInput) => Promise<void>;
}

const EMPTY: ProveedorInput = {
  ruc: '',
  razonSocial: '',
  categoria: CATEGORIAS_PROVEEDOR[0],
  email: '',
  telefono: '',
  direccion: '',
};

type Errors = Partial<Record<keyof ProveedorInput, string>>;

function validate(v: ProveedorInput): Errors {
  const errors: Errors = {};
  if (!isValidRuc(v.ruc)) errors.ruc = 'El RUC debe tener 11 dígitos';
  if (v.razonSocial.trim().length < 3) errors.razonSocial = 'Ingresa la razón social';
  if (!isValidEmail(v.email)) errors.email = 'Correo inválido';
  if (!isValidPhone(v.telefono)) errors.telefono = 'Teléfono inválido';
  if (v.direccion.trim().length < 5) errors.direccion = 'Ingresa la dirección';
  return errors;
}

const CATEGORY_OPTIONS = CATEGORIAS_PROVEEDOR.map((c) => ({ value: c, label: c }));
const FORM_ID = 'proveedor-form';

export function ProveedorFormDialog({ open, proveedor, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<ProveedorInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Cada vez que se abre, carga el proveedor a editar o limpia el formulario
  useEffect(() => {
    if (!open) return;
    setValues(
      proveedor
        ? {
            ruc: proveedor.ruc,
            razonSocial: proveedor.razonSocial,
            categoria: proveedor.categoria,
            email: proveedor.email,
            telefono: proveedor.telefono,
            direccion: proveedor.direccion,
          }
        : EMPTY,
    );
    setErrors({});
    setSubmitError(null);
  }, [open, proveedor]);

  const set = <K extends keyof ProveedorInput>(key: K, value: ProveedorInput[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        ...values,
        razonSocial: values.razonSocial.trim(),
        direccion: values.direccion.trim(),
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
      title={proveedor ? 'Editar proveedor' : 'Registrar proveedor'}
      description="Los campos con * son obligatorios."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={submitting}>
            {proveedor ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input
          label="RUC"
          required
          inputMode="numeric"
          maxLength={11}
          value={values.ruc}
          onChange={(e) => set('ruc', e.target.value.replace(/\D/g, ''))}
          error={errors.ruc}
        />
        <Select
          label="Categoría"
          required
          options={CATEGORY_OPTIONS}
          value={values.categoria}
          onChange={(e) => set('categoria', e.target.value as CategoriaProveedor)}
        />
        <div className="sm:col-span-2">
          <Input
            label="Razón social"
            required
            value={values.razonSocial}
            onChange={(e) => set('razonSocial', e.target.value)}
            error={errors.razonSocial}
          />
        </div>
        <Input
          label="Correo electrónico"
          required
          type="email"
          value={values.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
        />
        <Input
          label="Teléfono"
          required
          type="tel"
          value={values.telefono}
          onChange={(e) => set('telefono', e.target.value)}
          error={errors.telefono}
        />
        <div className="sm:col-span-2">
          <Input
            label="Dirección"
            required
            value={values.direccion}
            onChange={(e) => set('direccion', e.target.value)}
            error={errors.direccion}
          />
        </div>
        {submitError && (
          <p role="alert" className="text-sm text-destructive sm:col-span-2">
            {submitError}
          </p>
        )}
      </form>
    </Dialog>
  );
}