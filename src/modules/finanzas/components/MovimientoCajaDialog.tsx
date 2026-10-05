import { useEffect, useState, type FormEvent } from 'react';
import { Button, Dialog, Input, Select } from '@/components/ui';
import type { MovimientoCajaInput, TipoMovimientoCaja } from '@/types/finanzas';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: MovimientoCajaInput) => Promise<void>;
}

const TIPOS = [
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'egreso', label: 'Egreso' },
];

const FORM_ID = 'movimiento-caja-form';

export function MovimientoCajaDialog({ open, onClose, onSubmit }: Props) {
  const [tipo, setTipo] = useState<TipoMovimientoCaja>('ingreso');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [errors, setErrors] = useState<{ concepto?: string; monto?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTipo('ingreso');
    setConcepto('');
    setMonto('');
    setErrors({});
    setSubmitError(null);
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const importe = Number(monto);
    const found: typeof errors = {};
    if (concepto.trim().length < 3) found.concepto = 'Describe el concepto';
    if (!(importe > 0)) found.monto = 'Ingresa un monto mayor a cero';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({ tipo, concepto: concepto.trim(), monto: importe });
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
      title="Nuevo movimiento de caja"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button type="submit" form={FORM_ID} isLoading={submitting}>Registrar</Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Select label="Tipo" options={TIPOS} value={tipo} onChange={(e) => setTipo(e.target.value as TipoMovimientoCaja)} />
        <Input label="Concepto" required value={concepto} onChange={(e) => setConcepto(e.target.value)} error={errors.concepto} />
        <Input label="Monto (S/)" type="number" required min="0" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} error={errors.monto} />
        {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
      </form>
    </Dialog>
  );
}