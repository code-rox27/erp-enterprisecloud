import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button, Dialog, Input, Select } from '@/components/ui';
import type { OrdenInput, Prioridad } from '@/types/compras';
import type { Producto } from '@/types/inventario';
import type { Proveedor } from '@/types/proveedor';
import { formatCurrency, round2 } from '@/utils/formatters';

interface Props {
  open: boolean;
  proveedores: readonly Proveedor[];
  productos: readonly Producto[];
  onClose: () => void;
  onSubmit: (input: OrdenInput) => Promise<void>;
}

interface LineaForm {
  key: number;
  productoId: string;
  cantidad: string;
  costo: string;
}

const PRIORIDADES = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];

const FORM_ID = 'orden-form';

let siguienteKey = 1;
const nuevaLinea = (): LineaForm => ({ key: siguienteKey++, productoId: '', cantidad: '1', costo: '' });

export function OrdenFormDialog({ open, proveedores, productos, onClose, onSubmit }: Props) {
  const [proveedorId, setProveedorId] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('media');
  const [lineas, setLineas] = useState<LineaForm[]>([]);
  const [errors, setErrors] = useState<{ proveedorId?: string; lineas?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setProveedorId('');
    setPrioridad('media');
    setLineas([nuevaLinea()]);
    setErrors({});
    setSubmitError(null);
  }, [open]);

  const proveedorOptions = useMemo(
    () => proveedores.filter((p) => p.estado === 'activo').map((p) => ({ value: p.id, label: p.razonSocial })),
    [proveedores],
  );
  const productoOptions = useMemo(
    () => productos.filter((p) => p.estado === 'activo').map((p) => ({ value: p.id, label: `${p.sku} · ${p.nombre}` })),
    [productos],
  );

  const total = round2(lineas.reduce((s, l) => s + (Number(l.cantidad) || 0) * (Number(l.costo) || 0), 0));

  const actualizar = (key: number, cambios: Partial<LineaForm>) =>
    setLineas((prev) => prev.map((l) => (l.key === key ? { ...l, ...cambios } : l)));

  const elegirProducto = (key: number, productoId: string) => {
    const producto = productos.find((p) => p.id === productoId);
    actualizar(key, { productoId, costo: producto ? String(producto.precioCompra) : '' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found: typeof errors = {};
    if (!proveedorId) found.proveedorId = 'Selecciona un proveedor';

    const ids = lineas.map((l) => l.productoId);
    if (lineas.length === 0) found.lineas = 'Agrega al menos un producto';
    else if (lineas.some((l) => !l.productoId)) found.lineas = 'Selecciona el producto en cada línea';
    else if (new Set(ids).size !== ids.length) found.lineas = 'Hay productos repetidos';
    else if (lineas.some((l) => !(Number(l.cantidad) > 0))) found.lineas = 'Todas las cantidades deben ser mayores a cero';
    else if (lineas.some((l) => !(Number(l.costo) > 0))) found.lineas = 'Todos los costos deben ser mayores a cero';

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        proveedorId,
        prioridad,
        lineas: lineas.map((l) => ({
          productoId: l.productoId,
          cantidad: Number(l.cantidad),
          costoUnitario: Number(l.costo),
        })),
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo registrar la orden');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      closeOnOverlayClick={false}
      size="xl"
      title="Nueva orden de compra"
      description="La orden nace pendiente de aprobación. El stock sube cuando registres la recepción."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button type="submit" form={FORM_ID} isLoading={submitting}>Registrar orden</Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <Select label="Proveedor" required placeholder="Selecciona…" options={proveedorOptions} value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} error={errors.proveedorId} />
          <Select label="Prioridad" options={PRIORIDADES} value={prioridad} onChange={(e) => setPrioridad(e.target.value as Prioridad)} />
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-semibold text-foreground">Productos</legend>
          {lineas.map((l, i) => (
            <div key={l.key} className="grid items-start gap-2 sm:grid-cols-[1fr_110px_130px_auto]">
              <Select aria-label={`Producto ${i + 1}`} placeholder="Selecciona…" options={productoOptions} value={l.productoId} onChange={(e) => elegirProducto(l.key, e.target.value)} />
              <Input aria-label={`Cantidad ${i + 1}`} type="number" min="0" step="any" placeholder="Cantidad" value={l.cantidad} onChange={(e) => actualizar(l.key, { cantidad: e.target.value })} />
              <Input aria-label={`Costo unitario ${i + 1}`} type="number" min="0" step="0.01" placeholder="Costo (S/)" value={l.costo} onChange={(e) => actualizar(l.key, { costo: e.target.value })} />
              <Button variant="ghost" aria-label={`Quitar producto ${i + 1}`} disabled={lineas.length === 1} onClick={() => setLineas((prev) => prev.filter((x) => x.key !== l.key))}>
                Quitar
              </Button>
            </div>
          ))}
          {errors.lineas && <p role="alert" className="text-xs text-destructive">{errors.lineas}</p>}
          <div>
            <Button variant="outline" size="sm" onClick={() => setLineas((prev) => [...prev, nuevaLinea()])}>
              + Agregar producto
            </Button>
          </div>
        </fieldset>

        <div className="flex justify-between rounded-md border border-border bg-background p-3 text-sm">
          <span className="text-muted-foreground">Total de la orden</span>
          <strong className="text-foreground">{formatCurrency(total)}</strong>
        </div>

        {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
      </form>
    </Dialog>
  );
}