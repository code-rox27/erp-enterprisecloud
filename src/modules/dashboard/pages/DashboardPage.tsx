import type { CSSProperties } from 'react'

const colors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  foreground: '#020817',
  muted: '#64748B',
  border: '#E2E8F0',
}

const panelStyle: CSSProperties = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: '18px',
  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
}

export function DashboardPage() {
  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <h1 style={{ margin: 0, fontSize: '2rem', color: colors.foreground }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <div style={{ ...panelStyle, padding: '20px' }}>
          <p style={{ margin: 0, color: colors.muted, fontSize: '0.8rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Ventas del mes</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>S/. 134,000</h2>
        </div>
        <div style={{ ...panelStyle, padding: '20px' }}>
          <p style={{ margin: 0, color: colors.muted, fontSize: '0.8rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Compras</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>S/. 88,300</h2>
        </div>
        <div style={{ ...panelStyle, padding: '20px' }}>
          <p style={{ margin: 0, color: colors.muted, fontSize: '0.8rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Proveedores activos</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>24</h2>
        </div>
      </div>
    </div>
  )
}
