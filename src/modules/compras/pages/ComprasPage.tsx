import { useState } from 'react';
import { Button, StatCard, Tabs, type TabItem } from '@/components/ui';
import { PagoDialog } from '@/modules/finanzas';
import type { OrdenCompra } from '@/types/compras';
import { esRecibible } from '@/utils/compras';
import { formatCurrency, round2 } from '@/utils/formatters';
import { useCompras } from '../hooks/useCompras';
import { DevolucionesTab, FacturasTab, PagosTab, RecepcionesTab, SolicitudesTab } from '../components/ComprasTablas';
import { FacturaDialog } from '../components/FacturaDialog';
import { OrdenFormDialog } from '../components/OrdenFormDialog';
import { OrdenesTab } from '../components/OrdenesTab';
import { RecepcionDialog } from '../components/RecepcionDialog';

type TabId = 'solicitudes' | 'ordenes' | 'recepcion' | 'facturas' | 'pagos' | 'devoluciones';

export function ComprasPage() {
  const c = useCompras();
  const [tab, setTab] = useState<TabId>('ordenes');
  const [ordenOpen, setOrdenOpen] = useState(false);
  const [recibirId, setRecibirId] = useState<string | null>(null);
  const [facturarId, setFacturarId] = useState<string | null>(null);
  const [pagarCuentaId, setPagarCuentaId] = useState<string | null>(null);

  // Se derivan de la lista para que los diálogos reflejen siempre el estado actual
  const ordenRecibir = c.ordenes.find((o) => o.id === recibirId) ?? null;
  const ordenFacturar = c.ordenes.find((o) => o.id === facturarId) ?? null;
  const proveedorFacturar = ordenFacturar ? c.proveedorPorId.get(ordenFacturar.proveedorId) ?? null : null;
  const cuentaPagar = pagarCuentaId ? c.cuentaPorId.get(pagarCuentaId) ?? null : null;

  const porAprobar = c.ordenes.filter((o) => o.estado === 'pendiente').length;
  const porRecibir = c.ordenes.filter((o) => esRecibible(o.estado)).length;
  const cuentasAbiertas = c.cuentas.filter((x) => x.saldo > 0);
  const deudaTotal = round2(cuentasAbiertas.reduce((s, x) => s + x.saldo, 0));
  const solicitudesPendientes = c.solicitudes.filter((s) => s.estado === 'pendiente').length;

  const tabs: TabItem<TabId>[] = [
    { id: 'solicitudes', label: 'Solicitudes', count: c.solicitudes.length },
    { id: 'ordenes', label: 'Órdenes', count: c.ordenes.length },
    { id: 'recepcion', label: 'Recepción', count: c.recepciones.length },
    { id: 'facturas', label: 'Facturas', count: c.facturas.length },
    { id: 'pagos', label: 'Pagos' },
    { id: 'devoluciones', label: 'Devoluciones', count: c.devoluciones.length },
  ];

  const abrirRecibir = (o: OrdenCompra) => setRecibirId(o.id);
  const abrirFacturar = (o: OrdenCompra) => setFacturarId(o.id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gestión de compras</h1>
          <p className="text-sm text-muted-foreground">
            Solicitudes, órdenes, recepción en almacén, facturas y pagos a proveedores.
          </p>
        </div>
        <Button
          onClick={() => {
            setTab('ordenes');
            setOrdenOpen(true);
          }}
        >
          + Nueva orden
        </Button>
      </header>

      {c.error ? (
        <div role="alert" className="rounded-lg border border-destructive p-6 text-center">
          <p className="mb-3 text-sm text-destructive">{c.error}</p>
          <Button variant="outline" onClick={() => void c.reload()}>Reintentar</Button>
        </div>
      ) : (
        <>
          <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Solicitudes pendientes" value={String(solicitudesPendientes)} />
            <StatCard title="Órdenes por aprobar" value={String(porAprobar)} tone={porAprobar > 0 ? 'warning' : 'default'} />
            <StatCard title="Órdenes por recibir" value={String(porRecibir)} hint="Aprobadas o con recepción parcial" />
            <StatCard
              title="Deuda con proveedores"
              value={formatCurrency(deudaTotal)}
              hint={`${cuentasAbiertas.length} facturas abiertas`}
              tone={deudaTotal > 0 ? 'danger' : 'success'}
            />
          </section>

          <Tabs items={tabs} value={tab} onChange={setTab} />

          {tab === 'solicitudes' && (
            <SolicitudesTab solicitudes={c.solicitudes} proveedorPorId={c.proveedorPorId} isLoading={c.isLoading} />
          )}
          {tab === 'ordenes' && (
            <OrdenesTab
              ordenes={c.ordenes}
              proveedorPorId={c.proveedorPorId}
              productoPorId={c.productoPorId}
              facturaPorOrden={c.facturaPorOrden}
              isLoading={c.isLoading}
              onAprobar={c.aprobarOrden}
              onRechazar={c.rechazarOrden}
              onCancelar={c.cancelarOrden}
              onRecibir={abrirRecibir}
              onFacturar={abrirFacturar}
            />
          )}
          {tab === 'recepcion' && (
            <RecepcionesTab
              recepciones={c.recepciones}
              ordenPorId={c.ordenPorId}
              proveedorPorId={c.proveedorPorId}
              productoPorId={c.productoPorId}
              almacenPorId={c.almacenPorId}
              isLoading={c.isLoading}
            />
          )}
          {tab === 'facturas' && (
            <FacturasTab
              facturas={c.facturas}
              ordenPorId={c.ordenPorId}
              proveedorPorId={c.proveedorPorId}
              cuentaPorId={c.cuentaPorId}
              isLoading={c.isLoading}
              onPagar={setPagarCuentaId}
            />
          )}
          {tab === 'pagos' && <PagosTab cuentas={c.cuentas} isLoading={c.isLoading} />}
          {tab === 'devoluciones' && (
            <DevolucionesTab
              devoluciones={c.devoluciones}
              ordenPorId={c.ordenPorId}
              proveedorPorId={c.proveedorPorId}
              productoPorId={c.productoPorId}
              isLoading={c.isLoading}
            />
          )}
        </>
      )}

      <OrdenFormDialog
        open={ordenOpen}
        proveedores={c.proveedores}
        productos={c.productos}
        onClose={() => setOrdenOpen(false)}
        onSubmit={c.crearOrden}
      />
      <RecepcionDialog
        orden={ordenRecibir}
        almacenes={c.almacenes}
        productoPorId={c.productoPorId}
        onClose={() => setRecibirId(null)}
        onSubmit={c.registrarRecepcion}
      />
      <FacturaDialog
        orden={ordenFacturar}
        proveedor={proveedorFacturar}
        onClose={() => setFacturarId(null)}
        onSubmit={c.registrarFactura}
      />
      <PagoDialog
        cuenta={cuentaPagar}
        tipo="pagar"
        onClose={() => setPagarCuentaId(null)}
        onSubmit={c.registrarPago}
      />
    </div>
  );
}