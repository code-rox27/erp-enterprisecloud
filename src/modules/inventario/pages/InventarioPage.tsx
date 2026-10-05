import { useMemo, useState } from 'react';
import { Button, StatCard, Tabs, type TabItem } from '@/components/ui';
import { formatCurrency } from '@/utils/formatters';
import { useInventario } from '../hooks/useInventario';
import { AjusteDialog } from '../components/AjusteDialog';
import { AlmacenesTab } from '../components/AlmacenesTab';
import { KardexTab } from '../components/KardexTab';
import { ProductoFormDialog } from '../components/ProductoFormDialog';
import { ProductosTab } from '../components/ProductosTab';
import { TransferenciaFormDialog } from '../components/TransferenciaFormDialog';
import { TransferenciasTab } from '../components/TransferenciasTab';

type TabId = 'catalogo' | 'almacenes' | 'kardex' | 'transferencias';

export function InventarioPage() {
  const inv = useInventario();
  const [tab, setTab] = useState<TabId>('catalogo');
  const [productoOpen, setProductoOpen] = useState(false);
  const [ajusteOpen, setAjusteOpen] = useState(false);
  const [transferenciaOpen, setTransferenciaOpen] = useState(false);

  const categorias = useMemo(
    () => Array.from(new Set(inv.productos.map((p) => p.categoria))).sort(),
    [inv.productos],
  );

  const tabs: TabItem<TabId>[] = [
    { id: 'catalogo', label: 'Catálogo', count: inv.productos.length },
    { id: 'almacenes', label: 'Almacenes', count: inv.almacenes.length },
    { id: 'kardex', label: 'Kardex', count: inv.kardex.length },
    { id: 'transferencias', label: 'Transferencias', count: inv.transferencias.length },
  ];

  const activos = inv.productos.filter((p) => p.estado === 'activo').length;
  const almacenesActivos = inv.almacenes.filter((a) => a.estado === 'activo').length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Inventario</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo, existencias por almacén, Kardex y transferencias.
          </p>
        </div>
        {tab === 'catalogo' && <Button onClick={() => setProductoOpen(true)}>+ Nuevo producto</Button>}
        {tab === 'kardex' && <Button onClick={() => setAjusteOpen(true)}>Registrar ajuste</Button>}
        {tab === 'transferencias' && <Button onClick={() => setTransferenciaOpen(true)}>+ Nueva transferencia</Button>}
      </header>

      {inv.error ? (
        <div role="alert" className="rounded-lg border border-destructive p-6 text-center">
          <p className="mb-3 text-sm text-destructive">{inv.error}</p>
          <Button variant="outline" onClick={() => void inv.reload()}>Reintentar</Button>
        </div>
      ) : (
        <>
          <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Productos activos" value={String(activos)} hint={`${inv.productos.length} en el catálogo`} />
            <StatCard title="Almacenes activos" value={String(almacenesActivos)} hint={`${inv.almacenes.length} registrados`} />
            <StatCard
              title="Stock bajo"
              value={String(inv.stockBajo.length)}
              hint={inv.stockBajo.length > 0 ? inv.stockBajo.map((p) => p.nombre).join(', ') : 'Todo sobre el mínimo'}
              tone={inv.stockBajo.length > 0 ? 'danger' : 'success'}
            />
            <StatCard title="Valor del inventario" value={formatCurrency(inv.valorTotal)} hint="A precio de compra" />
          </section>

          <Tabs items={tabs} value={tab} onChange={setTab} />

          {tab === 'catalogo' && (
            <ProductosTab
              productos={inv.productos}
              categorias={categorias}
              existencias={inv.existencias}
              stockTotal={inv.stockTotal}
              almacenPorId={inv.almacenPorId}
              isLoading={inv.isLoading}
            />
          )}
          {tab === 'almacenes' && (
            <AlmacenesTab almacenes={inv.almacenes} existencias={inv.existencias} isLoading={inv.isLoading} />
          )}
          {tab === 'kardex' && (
            <KardexTab
              kardex={inv.kardex}
              productos={inv.productos}
              almacenes={inv.almacenes}
              productoPorId={inv.productoPorId}
              almacenPorId={inv.almacenPorId}
              isLoading={inv.isLoading}
            />
          )}
          {tab === 'transferencias' && (
            <TransferenciasTab
              transferencias={inv.transferencias}
              productoPorId={inv.productoPorId}
              almacenPorId={inv.almacenPorId}
              isLoading={inv.isLoading}
              onAvanzar={inv.avanzarTransferencia}
              onCancelar={inv.cancelarTransferencia}
            />
          )}
        </>
      )}

      <ProductoFormDialog
        open={productoOpen}
        categorias={categorias}
        onClose={() => setProductoOpen(false)}
        onSubmit={inv.crearProducto}
      />
      <AjusteDialog
        open={ajusteOpen}
        productos={inv.productos}
        almacenes={inv.almacenes}
        existencias={inv.existencias}
        onClose={() => setAjusteOpen(false)}
        onSubmit={inv.registrarAjuste}
      />
      <TransferenciaFormDialog
        open={transferenciaOpen}
        productos={inv.productos}
        almacenes={inv.almacenes}
        existencias={inv.existencias}
        onClose={() => setTransferenciaOpen(false)}
        onSubmit={inv.crearTransferencia}
      />
    </div>
  );
}