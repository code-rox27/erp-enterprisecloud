import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthProvider';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
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