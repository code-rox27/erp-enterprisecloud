import { useEffect, useState, type FormEvent } from 'react';
import { Button, Dialog, Input, Select } from '@/components/ui';
import { bancoService } from '@/services/bancoService';
import type { Cuenta, CuentaBancaria, MedioPago, PagoInput, TipoCuenta } from '@/types/finanzas';
import { todayISO } from '@/utils/dates';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface Props {
  cuenta: Cuenta | null;
  tipo: TipoCuenta;
  onClose: () => void;
  onSubmit: (id: string, input: PagoInput) => Promise<void>;
}

interface FormState {
  fecha: string;
  monto: string;
  medio: MedioPago;
  referencia: string;
  cuentaBancariaId: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const MEDIOS = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'tarjeta', label: 'Tarjeta' },
];

const FORM_ID = 'pago-form';

export function PagoDialog({ cuenta, tipo, onClose, onSubmit }: Props) {
  const esCobro = tipo === 'cobrar';
  const label = esCobro ? 'cobro' : 'pago';

  const [values, setValues] = useState<FormState>({
    fecha: todayISO(),
    monto: '',
    medio: 'transferencia',
    referencia: '',
    cuentaBancariaId: '',
  });
  const [bancos, setBancos] = useState<CuentaBancaria[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cuentaId = cuenta?.id;
  const saldo = cuenta?.saldo;

  // Al abrir una cuenta distinta, el monto sugerido es el saldo completo
  useEffect(() => {
    if (cuentaId === undefined || saldo === undefined) return;
    setValues({
      fecha: todayISO(),
      monto: String(saldo),
      medio: 'transferencia',
      referencia: '',
      cuentaBancariaId: '',
    });
    setErrors({});
    setSubmitError(null);
  }, [cuentaId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cuentas bancarias en soles (aún no hay conversión de moneda)
  useEffect(() => {
    if (cuentaId === undefined) return;
    let activo = true;
    bancoService
      .listCuentas()
      .then((lista) => {
        if (!activo) return;
        const soles = lista.filter((c) => c.moneda === 'PEN');
        setBancos(soles);
        const primera = soles[0];
        if (primera) {
          setValues((prev) => (prev.cuentaBancariaId ? prev : { ...prev, cuentaBancariaId: primera.id }));
        }
      })
      .catch(() => {
        if (activo) setBancos([]);
      });
    return () => {
      activo = false;
    };
  }, [cuentaId]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const cambiarMedio = (medio: MedioPago) =>
    setValues((prev) => ({ ...prev, medio, fecha: medio === 'efectivo' ? todayISO() : prev.fecha }));

  const esEfectivo = values.medio === 'efectivo';
  const hoy = todayISO();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!cuenta) return;

    const monto = Number(values.monto);
    const found: Errors = {};
    if (!values.fecha) found.fecha = 'Indica la fecha';
    else if (esEfectivo && values.fecha !== hoy) found.fecha = 'El efectivo se registra con la fecha de hoy';
    if (!(monto > 0)) found.monto = 'Ingresa un monto mayor a cero';
    else if (monto > cuenta.saldo + 0.001)
      found.monto = `No puede exceder el saldo (${formatCurrency(cuenta.saldo)})`;
    if (!esEfectivo && values.referencia.trim() === '')
      found.referencia = 'Indica el N.º de operación o cheque';
    if (!esEfectivo && values.cuentaBancariaId === '')
      found.cuentaBancariaId = 'Selecciona la cuenta bancaria';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(cuenta.id, {
        fecha: values.fecha,
        monto,
        medio: values.medio,
        referencia: values.referencia.trim(),
        cuentaBancariaId: esEfectivo ? undefined : values.cuentaBancariaId,
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : `No se pudo registrar el ${label}`);
    } finally {
      setSubmitting(false);
    }
  };

  const bancoOptions = bancos.map((b) => ({
    value: b.id,
    label: `${b.banco} · ${b.alias} (${b.numeroEnmascarado})`,
  }));

  return (
    <Dialog
      open={cuenta !== null}
      onClose={onClose}
      closeOnOverlayClick={false}
      size="lg"
      title={`Registrar ${label}`}
      description={cuenta ? `${cuenta.contraparte} · ${cuenta.documento}` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={submitting}>
            Registrar {label}
          </Button>
        </>
      }
    >
      {cuenta && (
        <div className="flex flex-col gap-6">
          <dl className="grid grid-cols-3 gap-4 rounded-md border border-border bg-background p-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Monto original</dt>
              <dd className="font-medium text-foreground">{formatCurrency(cuenta.monto)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Saldo pendiente</dt>
              <dd className="font-medium text-foreground">{formatCurrency(cuenta.saldo)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Vencimiento</dt>
              <dd className="font-medium text-foreground">{formatDate(cuenta.vencimiento)}</dd>
            </div>
          </dl>

          <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Medio"
              options={MEDIOS}
              value={values.medio}
              onChange={(e) => cambiarMedio(e.target.value as MedioPago)}
            />
            <Input
              label="Fecha"
              type="date"
              required
              value={values.fecha}
              min={esEfectivo ? hoy : undefined}
              max={esEfectivo ? hoy : undefined}
              onChange={(e) => set('fecha', e.target.value)}
              error={errors.fecha}
            />
            <Input
              label="Monto"
              type="number"
              required
              min="0"
              step="0.01"
              value={values.monto}
              onChange={(e) => set('monto', e.target.value)}
              error={errors.monto}
            />
            {esEfectivo ? (
              <p className="self-end text-xs text-muted-foreground">
                Se registrará como {esCobro ? 'ingreso' : 'egreso'} en la caja de hoy.
              </p>
            ) : (
              <Input
                label="Referencia"
                required
                placeholder="N.º de operación / cheque"
                value={values.referencia}
                onChange={(e) => set('referencia', e.target.value)}
                error={errors.referencia}
              />
            )}
            {!esEfectivo && (
              <div className="sm:col-span-2">
                <Select
                  label="Cuenta bancaria"
                  required
                  placeholder="Selecciona…"
                  options={bancoOptions}
                  value={values.cuentaBancariaId}
                  onChange={(e) => set('cuentaBancariaId', e.target.value)}
                  error={errors.cuentaBancariaId}
                  hint={`Se registrará un ${esCobro ? 'abono' : 'cargo'} pendiente de conciliar.`}
                />
              </div>
            )}
            {submitError && (
              <p role="alert" className="text-sm text-destructive sm:col-span-2">
                {submitError}
              </p>
            )}
          </form>

          {cuenta.pagos.length > 0 && (
            <section aria-label="Historial">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Historial de {label}s</h3>
              <ul className="divide-y divide-border rounded-md border border-border text-sm">
                {cuenta.pagos.map((p) => (
                  <li key={p.id} className="flex justify-between gap-4 px-3 py-2">
                    <span className="text-muted-foreground">
                      {formatDate(p.fecha)} · {p.medio}
                      {p.referencia && ` · ${p.referencia}`}
                    </span>
                    <span className="font-medium text-foreground">{formatCurrency(p.monto)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Dialog>
  );
}