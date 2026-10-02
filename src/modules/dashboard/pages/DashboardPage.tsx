export const DashboardPage = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard General</h2>
      <p className="text-muted-foreground">Bienvenido al panel principal de gestión del ERP.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Ventas del Mes</h3>
          <p className="text-2xl font-bold text-foreground mt-2">S/ 45,280.00</p>
        </div>
        <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Compras Pendientes</h3>
          <p className="text-2xl font-bold text-foreground mt-2">12 Órdenes</p>
        </div>
        <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Productos en Stock Crítico</h3>
          <p className="text-2xl font-bold text-destructive mt-2">5 Productos</p>
        </div>
      </div>
    </div>
  );
};