import { useState } from 'react';
import { Badge, Button, Table, type TableColumn } from '@/components/ui';
import type { ArqueoCaja, MovimientoCaja } from '@/types/finanzas';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useCaja } from '../hooks/useCaja';
import { ArqueoDialog } from '../components/ArqueoDialog';
import { MovimientoCajaDialog } from '../components/MovimientoCajaDialog';
import { StatCard } from '../components/StatCard';

const movimientoColumns: TableColumn<MovimientoCaja>[] = [
  { key: 'hora', header: 'Hora', className: 'w-24' },
  { key: 'concepto', header: 'Concepto' },
  {
    key: 'tipo',
    header: 'Tipo',
    cell: (m) => (
      <Badge variant={m.tipo === 'ingreso' ? 'success' : 'danger'}>
        {m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
      </Badge>
    ),
  },
  {
    key: 'monto',
    header: 'Monto',
    align: 'right',
    cell: (m) => (
      <span className={m.tipo === 'ingreso' ? 'text-emerald-600' : 'text-destructive'}>
        {m.tipo === 'ingreso' ? '+' : '−'} {formatCurrency(m.monto)}
      </span>
    ),
  },
];

const arqueoColumns: TableColumn<ArqueoCaja>[] = [
  { key: 'fecha', header: 'Fecha', cell: (a) => `${formatDate(a.fecha)} · ${a.hora}` },
  { key: 'responsable', header: 'Responsable' },
  { key: 'saldoEsperado', header: 'Esperado', align: 'right', cell: (a) => formatCurrency(a.saldoEsperado) },
  { key: 'efectivoContado', header: 'Contado', align: 'right', cell: (a) => formatCurrency(a.efectivoContado) },
  {
    key: 'diferencia',
    header: 'Resultado',
    cell: (a) =>
      a.diferencia === 0 ? (
        <Badge variant="success" dot>Cuadra</Badge>
      ) : (
        <Badge variant={a.diferencia < 0 ? 'danger' : 'warning'} dot>
          {a.diferencia < 0 ? 'Faltante' : 'Sobrante'} {formatCurrency(Math.abs(a.diferencia))}
        </Badge>
      ),
  },
  { key: 'observaciones', header: 'Observaciones' },
];

export function CajaPage() {
  const { caja, arqueos, resumen, isLoading, error, reload, addMovimiento, registrarArqueo } = useCaja();
  const [movimientoOpen, setMovimientoOpen] = useState(false);
  const [arqueoOpen, setArqueoOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Caja y arqueo</h1>
          <p className="text-sm text-muted-foreground">
            {caja ? `Movimientos del ${formatDate(caja.fecha)}` : 'Movimientos del día'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!caja} onClick={() => setMovimientoOpen(true)}>
            + Movimiento
          </Button>
          <Button disabled={!caja} onClick={() => setArqueoOpen(true)}>
            Realizar arqueo
          </Button>
        </div>
      </header>

      {error ? (
        <div role="alert" className="rounded-lg border border-destructive p-6 text-center">
          <p className="mb-3 text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void reload()}>Reintentar</Button>
        </div>
      ) : (
        <>
          <section aria-label="Resumen de caja" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Saldo inicial" value={caja ? formatCurrency(caja.saldoInicial) : '—'} />
            <StatCard title="Ingresos" value={resumen ? formatCurrency(resumen.ingresos) : '—'} tone="success" />
            <StatCard title="Egresos" value={resumen ? formatCurrency(resumen.egresos) : '—'} tone="danger" />
            <StatCard title="Saldo esperado" value={resumen ? formatCurrency(resumen.saldoEsperado) : '—'} hint="Lo que debería haber en caja" />
          </section>

          <section aria-label="Movimientos del día" className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">Movimientos del día</h2>
            <Table<MovimientoCaja>
              columns={movimientoColumns}
              data={caja?.movimientos ?? []}
              rowKey={(m) => m.id}
              isLoading={isLoading}
              emptyMessage="Aún no hay movimientos hoy."
            />
          </section>

          <section aria-label="Historial de arqueos" className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">Historial de arqueos</h2>
            <Table<ArqueoCaja>
              columns={arqueoColumns}
              data={arqueos}
              rowKey={(a) => a.id}
              isLoading={isLoading}
              emptyMessage="Todavía no se realizaron arqueos."
            />
          </section>
        </>
      )}

      <MovimientoCajaDialog open={movimientoOpen} onClose={() => setMovimientoOpen(false)} onSubmit={addMovimiento} />
      <ArqueoDialog
        open={arqueoOpen}
        saldoEsperado={resumen?.saldoEsperado ?? 0}
        onClose={() => setArqueoOpen(false)}
        onSubmit={registrarArqueo}
      />
    </div>
  );
}