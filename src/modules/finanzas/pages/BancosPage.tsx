import { useMemo, useState } from 'react';
import { Badge, Button, Select, Table, type TableColumn } from '@/components/ui';
import type { Moneda, MovimientoBancario } from '@/types/finanzas';
import { resumenBanco } from '@/utils/finanzas';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { useBancos } from '../hooks/useBancos';
import { StatCard } from '../components/StatCard';

const FILTRO_OPTIONS = [
  { value: 'pendiente', label: 'Pendientes de conciliar' },
  { value: 'conciliado', label: 'Conciliados' },
];

export function BancosPage() {
  const { cuentas, movimientos, isLoading, error, reload, conciliar } = useBancos();
  const [cuentaId, setCuentaId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);

  // Si el usuario no eligió una cuenta, se usa la primera
  const cuenta = cuentas.find((c) => c.id === cuentaId) ?? cuentas[0] ?? null;
  const moneda: Moneda = cuenta?.moneda ?? 'PEN';

  const resumen = useMemo(
    () => (cuenta ? resumenBanco(cuenta, movimientos) : null),
    [cuenta, movimientos],
  );

  const visibles = useMemo(
    () =>
      movimientos
        .filter((m) => m.cuentaId === cuenta?.id)
        .filter((m) => filtro === '' || (filtro === 'conciliado') === m.conciliado)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [movimientos, cuenta, filtro],
  );

  const handleConciliar = async (id: string) => {
    setProcesandoId(id);
    setAccionError(null);
    try {
      await conciliar(id);
    } catch (e) {
      setAccionError(e instanceof Error ? e.message : 'No se pudo conciliar');
    } finally {
      setProcesandoId(null);
    }
  };

  const columns: TableColumn<MovimientoBancario>[] = [
    { key: 'fecha', header: 'Fecha', cell: (m) => formatDate(m.fecha) },
    {
      key: 'descripcion',
      header: 'Descripción',
      cell: (m) => (
        <div>
          <p className="font-medium text-foreground">{m.descripcion}</p>
          <p className="text-xs text-muted-foreground">Ref. {m.referencia}</p>
        </div>
      ),
    },
    {
      key: 'abono',
      header: 'Abono',
      align: 'right',
      cell: (m) => (m.tipo === 'abono' ? <span className="text-emerald-600">{formatCurrency(m.monto, moneda)}</span> : '—'),
    },
    {
      key: 'cargo',
      header: 'Cargo',
      align: 'right',
      cell: (m) => (m.tipo === 'cargo' ? <span className="text-destructive">{formatCurrency(m.monto, moneda)}</span> : '—'),
    },
    {
      key: 'conciliado',
      header: 'Estado',
      cell: (m) =>
        m.conciliado ? (
          <Badge variant="success" dot>Conciliado</Badge>
        ) : (
          <Badge variant="warning" dot>Pendiente</Badge>
        ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (m) =>
        m.conciliado ? null : (
          <Button size="sm" variant="outline" isLoading={procesandoId === m.id} onClick={() => void handleConciliar(m.id)}>
            Conciliar
          </Button>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Bancos y conciliación</h1>
        <p className="text-sm text-muted-foreground">
          Compara los movimientos del banco con tus registros contables.
        </p>
      </header>

      {error ? (
        <div role="alert" className="rounded-lg border border-destructive p-6 text-center">
          <p className="mb-3 text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void reload()}>Reintentar</Button>
        </div>
      ) : (
        <>
          <section aria-label="Cuentas bancarias" className="grid gap-4 sm:grid-cols-2">
            {cuentas.map((c) => {
              const r = resumenBanco(c, movimientos);
              const activa = c.id === cuenta?.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => setCuentaId(c.id)}
                  className={cn(
                    'rounded-lg border bg-card p-4 text-left transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    activa ? 'border-primary ring-1 ring-primary' : 'border-border hover:bg-background',
                  )}
                >
                  <p className="text-sm font-semibold text-foreground">
                    {c.banco} · {c.moneda}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.alias} · {c.numeroEnmascarado}
                  </p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {formatCurrency(r.saldoLibros, c.moneda)}
                  </p>
                </button>
              );
            })}
            {isLoading && cuentas.length === 0 && (
              <div className="h-28 animate-pulse rounded-lg border border-border bg-card" />
            )}
          </section>

          {cuenta && resumen && (
            <section aria-label="Resumen de conciliación" className="grid gap-4 sm:grid-cols-3">
              <StatCard title="Saldo en libros" value={formatCurrency(resumen.saldoLibros, moneda)} />
              <StatCard title="Saldo conciliado" value={formatCurrency(resumen.saldoConciliado, moneda)} tone="success" />
              <StatCard
                title="Por conciliar"
                value={formatCurrency(resumen.montoPendiente, moneda)}
                hint={`${resumen.cantidadPendientes} movimientos`}
                tone={resumen.cantidadPendientes > 0 ? 'warning' : 'default'}
              />
            </section>
          )}

          <div className="sm:max-w-xs">
            <Select
              aria-label="Filtrar movimientos"
              placeholder="Todos los movimientos"
              options={FILTRO_OPTIONS}
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          {accionError && <p role="alert" className="text-sm text-destructive">{accionError}</p>}

          <Table<MovimientoBancario>
            columns={columns}
            data={visibles}
            rowKey={(m) => m.id}
            isLoading={isLoading}
            emptyMessage="No hay movimientos para mostrar."
          />
        </>
      )}
    </div>
  );
}