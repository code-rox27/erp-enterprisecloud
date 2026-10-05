import { useMemo, useState } from 'react';
import { Button, Input, Select, Table, type TableColumn } from '@/components/ui';
import type { Cuenta, EstadoCuenta, TipoCuenta } from '@/types/finanzas';
import { daysBetween, todayISO } from '@/utils/dates';
import { getEstadoCuenta } from '@/utils/finanzas';
import { formatCurrency, formatDate, round2 } from '@/utils/formatters';
import { useCuentas } from '../hooks/useCuentas';
import { EstadoCuentaBadge } from './EstadoCuentaBadge';
import { PagoDialog } from './PagoDialog';
import { StatCard } from './StatCard';

const CONFIG: Record<
  TipoCuenta,
  { titulo: string; subtitulo: string; contraparte: string; accion: string; pendiente: string }
> = {
  cobrar: {
    titulo: 'Cuentas por cobrar',
    subtitulo: 'Seguimiento de facturas emitidas y cobros de clientes.',
    contraparte: 'Cliente',
    accion: 'Registrar cobro',
    pendiente: 'Total por cobrar',
  },
  pagar: {
    titulo: 'Cuentas por pagar',
    subtitulo: 'Obligaciones con proveedores y calendario de pagos.',
    contraparte: 'Proveedor',
    accion: 'Registrar pago',
    pendiente: 'Total por pagar',
  },
};

const ESTADO_OPTIONS = [
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'parcial', label: 'Pago parcial' },
  { value: 'vencida', label: 'Vencidas' },
  { value: 'pagada', label: 'Pagadas' },
];

type Fila = Cuenta & { estado: EstadoCuenta };

export function CuentasView({ tipo }: { tipo: TipoCuenta }) {
  const cfg = CONFIG[tipo];
  const { cuentas, isLoading, error, reload, registrarPago } = useCuentas(tipo);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [seleccionId, setSeleccionId] = useState<string | null>(null);

  const hoy = todayISO();

  const filas = useMemo<Fila[]>(
    () =>
      cuentas
        .map((c) => ({ ...c, estado: getEstadoCuenta(c, hoy) }))
        // abiertas primero, ordenadas por vencimiento más próximo
        .sort((a, b) => {
          if ((a.estado === 'pagada') !== (b.estado === 'pagada')) return a.estado === 'pagada' ? 1 : -1;
          return a.vencimiento.localeCompare(b.vencimiento);
        }),
    [cuentas, hoy],
  );

  const filtradas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return filas.filter(
      (f) =>
        (estado === '' || f.estado === estado) &&
        (q === '' || f.contraparte.toLowerCase().includes(q) || f.documento.toLowerCase().includes(q)),
    );
  }, [filas, search, estado]);

  const kpis = useMemo(() => {
    const abiertas = filas.filter((f) => f.estado !== 'pagada');
    const sum = (list: Fila[]) => round2(list.reduce((s, f) => s + f.saldo, 0));
    const vencidas = abiertas.filter((f) => f.estado === 'vencida');
    const porVencer = abiertas.filter((f) => {
      const dias = daysBetween(hoy, f.vencimiento);
      return dias >= 0 && dias <= 7;
    });
    return {
      total: sum(abiertas),
      abiertas: abiertas.length,
      vencido: sum(vencidas),
      vencidas: vencidas.length,
      porVencer: sum(porVencer),
      porVencerCount: porVencer.length,
    };
  }, [filas, hoy]);

  const seleccion = filas.find((f) => f.id === seleccionId) ?? null;

  const columns: TableColumn<Fila>[] = [
    {
      key: 'documento',
      header: 'Documento',
      cell: (f) => (
        <div>
          <p className="font-medium text-foreground">{f.documento}</p>
          <p className="text-xs text-muted-foreground">Emitido {formatDate(f.emision)}</p>
        </div>
      ),
    },
    { key: 'contraparte', header: cfg.contraparte },
    {
      key: 'vencimiento',
      header: 'Vencimiento',
      cell: (f) => {
        const dias = daysBetween(hoy, f.vencimiento);
        const detalle =
          f.saldo <= 0
            ? null
            : dias < 0
              ? { texto: `Vencida hace ${-dias} d`, clase: 'text-destructive' }
              : dias === 0
                ? { texto: 'Vence hoy', clase: 'text-amber-600' }
                : { texto: `Vence en ${dias} d`, clase: 'text-muted-foreground' };
        return (
          <div>
            <p>{formatDate(f.vencimiento)}</p>
            {detalle && <p className={`text-xs ${detalle.clase}`}>{detalle.texto}</p>}
          </div>
        );
      },
    },
    { key: 'monto', header: 'Monto', align: 'right', cell: (f) => formatCurrency(f.monto) },
    {
      key: 'saldo',
      header: 'Saldo',
      align: 'right',
      cell: (f) => <span className="font-medium">{formatCurrency(f.saldo)}</span>,
    },
    { key: 'estado', header: 'Estado', cell: (f) => <EstadoCuentaBadge estado={f.estado} /> },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (f) => (
        <Button size="sm" variant="outline" disabled={f.saldo <= 0} onClick={() => setSeleccionId(f.id)}>
          {cfg.accion}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">{cfg.titulo}</h1>
        <p className="text-sm text-muted-foreground">{cfg.subtitulo}</p>
      </header>

      <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title={cfg.pendiente} value={formatCurrency(kpis.total)} hint={`${kpis.abiertas} documentos abiertos`} />
        <StatCard title="Vencido" value={formatCurrency(kpis.vencido)} hint={`${kpis.vencidas} documentos vencidos`} tone={kpis.vencidas > 0 ? 'danger' : 'default'} />
        <StatCard title="Vence en 7 días" value={formatCurrency(kpis.porVencer)} hint={`${kpis.porVencerCount} documentos`} tone={kpis.porVencerCount > 0 ? 'warning' : 'default'} />
      </section>

      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <Input
          aria-label="Buscar"
          placeholder={`Buscar por ${cfg.contraparte.toLowerCase()} o documento…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          aria-label="Filtrar por estado"
          placeholder="Todos los estados"
          options={ESTADO_OPTIONS}
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        />
      </div>

      {error ? (
        <div role="alert" className="rounded-lg border border-destructive p-6 text-center">
          <p className="mb-3 text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void reload()}>Reintentar</Button>
        </div>
      ) : (
        <Table<Fila>
          columns={columns}
          data={filtradas}
          rowKey={(f) => f.id}
          isLoading={isLoading}
          emptyMessage="No hay documentos con esos filtros."
        />
      )}

      <PagoDialog cuenta={seleccion} tipo={tipo} onClose={() => setSeleccionId(null)} onSubmit={registrarPago} />
    </div>
  );
}