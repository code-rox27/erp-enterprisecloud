import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Badge, Button, Dialog, Input } from '@/components/ui';
import { DENOMINACIONES, type ArqueoInput, type ConteoEfectivo } from '@/types/finanzas';
import { totalConteo } from '@/utils/finanzas';
import { formatCurrency, round2 } from '@/utils/formatters';

interface Props {
  open: boolean;
  saldoEsperado: number;
  onClose: () => void;
  onSubmit: (input: ArqueoInput) => Promise<void>;
}

const FORM_ID = 'arqueo-form';
const labelDenominacion = (d: number): string => (d >= 10 ? `S/ ${d}` : `S/ ${d.toFixed(2)}`);

export function ArqueoDialog({ open, saldoEsperado, onClose, onSubmit }: Props) {
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const [responsable, setResponsable] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [errors, setErrors] = useState<{ responsable?: string; observaciones?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCantidades({});
    setResponsable('');
    setObservaciones('');
    setErrors({});
    setSubmitError(null);
  }, [open]);

  const conteo = useMemo<ConteoEfectivo>(() => {
    const result: ConteoEfectivo = {};
    for (const [key, raw] of Object.entries(cantidades)) {
      const n = Math.floor(Number(raw));
      if (n > 0) result[key] = n;
    }
    return result;
  }, [cantidades]);

  const contado = totalConteo(conteo);
  const diferencia = round2(contado - saldoEsperado);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found: typeof errors = {};
    if (responsable.trim().length < 3) found.responsable = 'Indica quién realiza el arqueo';
    if (diferencia !== 0 && observaciones.trim() === '')
      found.observaciones = 'Explica la diferencia encontrada';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({ responsable, conteo, observaciones });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo registrar el arqueo');
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
      title="Arqueo de caja"
      description="Cuenta el efectivo físico y compáralo con el saldo esperado del sistema."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button type="submit" form={FORM_ID} isLoading={submitting}>Cerrar arqueo</Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-foreground">Conteo de efectivo</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {DENOMINACIONES.map((den) => {
              const key = String(den);
              const cantidad = Math.floor(Number(cantidades[key] ?? 0)) || 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-20 text-sm font-medium text-foreground">{labelDenominacion(den)}</span>
                  <Input
                    aria-label={`Cantidad de ${labelDenominacion(den)}`}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="0"
                    value={cantidades[key] ?? ''}
                    onChange={(e) => setCantidades((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                  <span className="w-24 text-right text-xs text-muted-foreground">
                    {formatCurrency(round2(den * cantidad))}
                  </span>
                </div>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-4">
          <dl className="flex flex-col gap-2 rounded-md border border-border bg-background p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Saldo esperado</dt>
              <dd className="font-medium text-foreground">{formatCurrency(saldoEsperado)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Efectivo contado</dt>
              <dd className="font-medium text-foreground">{formatCurrency(contado)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <dt className="text-muted-foreground">Diferencia</dt>
              <dd>
                <Badge variant={diferencia === 0 ? 'success' : diferencia < 0 ? 'danger' : 'warning'}>
                  {diferencia === 0 ? 'Cuadra' : `${diferencia < 0 ? 'Faltante' : 'Sobrante'} ${formatCurrency(Math.abs(diferencia))}`}
                </Badge>
              </dd>
            </div>
          </dl>

          <Input label="Responsable" required value={responsable} onChange={(e) => setResponsable(e.target.value)} error={errors.responsable} />
          <Input
            label="Observaciones"
            required={diferencia !== 0}
            hint={diferencia !== 0 ? undefined : 'Opcional si la caja cuadra'}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            error={errors.observaciones}
          />
          {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
        </div>
      </form>
    </Dialog>
  );
}