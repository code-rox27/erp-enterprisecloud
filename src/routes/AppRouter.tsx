import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthProvider';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { ComprasPage } from '../modules/compras/pages/ComprasPage';
import { InventarioPage } from '../modules/inventario/pages/InventarioPage';
import { ProveedoresPage } from '../modules/proveedores/pages/ProveedoresPage';
import { VentasPage } from '../modules/ventas/pages/VentasPage';

export const AppRouter = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas Privadas / Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="ventas" element={<VentasPage />} />
              <Route path="compras" element={<ComprasPage />} />
              <Route path="inventario" element={<InventarioPage />} />
              <Route path="proveedores" element={<ProveedoresPage />} />

              <Route
                path="*"
                element={
                  <div className="p-6 text-center text-muted-foreground">
                    Módulo en construcción...
                  </div>
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};