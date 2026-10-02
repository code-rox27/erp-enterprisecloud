import type { CSSProperties } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage'
import { ProveedoresPage } from '@/modules/proveedores/pages/ProveedoresPage'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/proveedores', label: 'Proveedores' },
  { to: '/compras', label: 'Compras' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/reportes', label: 'Reportes' },
]

const colors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#2563EB',
  primaryText: '#FFFFFF',
  foreground: '#020817',
  muted: '#64748B',
  border: '#E2E8F0',
  panelShadow: 'rgba(15, 23, 42, 0.06)',
}

const shellStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  background: colors.background,
  color: colors.foreground,
  fontFamily: 'Inter, "Segoe UI", sans-serif',
}

const sidebarStyle: CSSProperties = {
  width: '248px',
  background: colors.card,
  borderRight: `1px solid ${colors.border}`,
  padding: '24px 18px',
  boxShadow: `inset -1px 0 0 ${colors.border}`,
}

const contentStyle: CSSProperties = {
  flex: 1,
  padding: '32px',
}

const panelStyle: CSSProperties = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: '18px',
  boxShadow: `0 10px 28px ${colors.panelShadow}`,
}

export function AppShell() {
  return (
    <div style={shellStyle}>
      <aside style={sidebarStyle}>
        <h2 style={{ margin: '0 0 24px', fontSize: '1.35rem', fontWeight: 700, color: colors.foreground }}>ERP EnterpriseCloud</h2>
        <nav style={{ display: 'grid', gap: '8px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'block',
                textDecoration: 'none',
                color: isActive ? colors.primaryText : colors.muted,
                background: isActive ? colors.primary : 'transparent',
                border: isActive ? 'none' : '1px solid transparent',
                padding: '10px 12px',
                borderRadius: '10px',
                fontWeight: 600,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main style={contentStyle}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/proveedores" element={<ProveedoresPage />} />
          <Route path="/compras" element={<PlaceholderPage title="Compras" description="Módulo de compras en construcción." />} />
          <Route path="/ventas" element={<PlaceholderPage title="Ventas" description="Módulo de ventas en construcción." />} />
          <Route path="/reportes" element={<PlaceholderPage title="Reportes" description="Módulo de reportes en construcción." />} />
        </Routes>
      </main>
    </div>
  )
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <h1 style={{ margin: 0, fontSize: '2rem', color: colors.foreground }}>{title}</h1>
      <div style={{ ...panelStyle, padding: '20px' }}>
        <p style={{ margin: 0, color: colors.muted }}>{description}</p>
      </div>
    </div>
  )
}
