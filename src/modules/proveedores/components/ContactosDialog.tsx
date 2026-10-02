import { useState, type FormEvent } from 'react';
import { Badge, Button, Dialog, Input } from '@/components/ui';
import type { ContactoInput, Proveedor } from '@/types/proveedor';
import { isValidEmail, isValidPhone } from '@/utils/validators';

interface Props {
  /** Proveedor cuyos contactos se gestionan; null = cerrado. */
  proveedor: Proveedor | null;
  onClose: () => void;
  onAdd: (proveedorId: string, input: ContactoInput) => Promise<void>;
  onRemove: (proveedorId: string, contactoId: string) => Promise<void>;
}

const EMPTY: ContactoInput = { nombre: '', cargo: '', email: '', telefono: '' };
type Errors = Partial<Record<keyof ContactoInput, string>>;

export function ContactosDialog({ proveedor, onClose, onAdd, onRemove }: Props) {
  const [values, setValues] = useState<ContactoInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof ContactoInput, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!proveedor) return;

    const found: Errors = {};
    if (values.nombre.trim().length < 3) found.nombre = 'Ingresa el nombre';
    if (values.cargo.trim().length < 2) found.cargo = 'Ingresa el cargo';
    if (!isValidEmail(values.email)) found.email = 'Correo inválido';
    if (!isValidPhone(values.telefono)) found.telefono = 'Teléfono inválido';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    setError(null);
    try {
      await onAdd(proveedor.id, values);
      setValues(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (contactoId: string) => {
    if (!proveedor) return;
    setBusy(true);
    setError(null);
    try {
      await onRemove(proveedor.id, contactoId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={proveedor !== null}
      onClose={onClose}
      size="lg"
      title="Contactos del proveedor"
      description={proveedor?.razonSocial}
      footer={<Button variant="outline" onClick={onClose}>Cerrar</Button>}
    >
      {proveedor && (
        <div className="flex flex-col gap-6">
          <section aria-label="Contactos registrados">
            {proveedor.contactos.length === 0 ? (
              <p className="rounded-md border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                Este proveedor aún no tiene contactos.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
                {proveedor.contactos.map((c) => (
                  <li key={c.id} className="flex items-start justify-between gap-4 p-3">
                    <div className="text-sm">
                      <p className="font-medium text-foreground">
                        {c.nombre}{' '}
                        {c.principal && <Badge variant="info">Principal</Badge>}
                      </p>
                      <p className="text-muted-foreground">{c.cargo}</p>
                      <p className="text-muted-foreground">
                        {c.email} · {c.telefono}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => void handleRemove(c.id)}
                      aria-label={`Eliminar contacto ${c.nombre}`}
                    >
                      Eliminar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <form onSubmit={handleAdd} noValidate className="grid gap-4 sm:grid-cols-2">
            <h3 className="text-sm font-semibold text-foreground sm:col-span-2">
              Agregar contacto
            </h3>
            <Input label="Nombre" value={values.nombre} onChange={(e) => set('nombre', e.target.value)} error={errors.nombre} />
            <Input label="Cargo" value={values.cargo} onChange={(e) => set('cargo', e.target.value)} error={errors.cargo} />
            <Input label="Correo" type="email" value={values.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
            <Input label="Teléfono" type="tel" value={values.telefono} onChange={(e) => set('telefono', e.target.value)} error={errors.telefono} />
            {error && (
              <p role="alert" className="text-sm text-destructive sm:col-span-2">
                {error}
              </p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" isLoading={busy}>Agregar contacto</Button>
            </div>
          </form>
        </div>
      )}
    </Dialog>
  );
}