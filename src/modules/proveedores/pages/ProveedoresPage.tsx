import { useMemo, useState, type CSSProperties } from 'react'
import { ProveedorFormDialog } from '@/modules/proveedores/components/ProveedorFormDialog'
import { useProveedores } from '@/modules/proveedores/hooks/useProveedores'
import type { Proveedor, ProveedorInput } from '@/types/proveedor'

const colors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#2563EB',
  foreground: '#020817',
  muted: '#64748B',
  border: '#E2E8F0',
  errorBg: '#FEF2F2',
}

const panelStyle: CSSProperties = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: '18px',
  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
}

const primaryButton: CSSProperties = {
  border: 'none',
  borderRadius: '10px',
  background: colors.primary,
  color: '#FFFFFF',
  fontWeight: 600,
  padding: '10px 16px',
  cursor: 'pointer',
  boxShadow: '0 8px 16px rgba(37, 99, 235, 0.18)',
}

const secondaryButton: CSSProperties = {
  border: `1px solid ${colors.border}`,
  borderRadius: '10px',
  background: colors.card,
  color: colors.foreground,
  fontWeight: 600,
  padding: '9px 14px',
  cursor: 'pointer',
}

const inputStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${colors.border}`,
  borderRadius: '10px',
  background: colors.card,
  color: colors.foreground,
  padding: '10px 12px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

const tableHeadStyle: CSSProperties = {
  textAlign: 'left',
  padding: '14px 16px',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: colors.muted,
}

const tableCellStyle: CSSProperties = {
  padding: '14px 16px',
  color: colors.foreground,
  fontSize: '14px',
  verticalAlign: 'middle',
}

export function ProveedoresPage() {
  const { proveedores, isLoading, error, reload, create, update } = useProveedores()
  const [query, setQuery] = useState('')
  const [estado, setEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Proveedor | null>(null)

  const filteredProveedores = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return proveedores.filter((proveedor) => {
      const matchesEstado = estado === 'todos' || proveedor.estado === estado
      const matchesQuery =
        normalized.length === 0 ||
        proveedor.razonSocial.toLowerCase().includes(normalized) ||
        proveedor.ruc.toLowerCase().includes(normalized)

      return matchesEstado && matchesQuery
    })
  }, [proveedores, query, estado])

  const totalActivos = proveedores.filter((p) => p.estado === 'activo').length
  const totalInactivos = proveedores.filter((p) => p.estado === 'inactivo').length

  const handleCreateOrUpdate = async (input: ProveedorInput) => {
    if (editing) {
      await update(editing.id, input)
      return
    }

    await create(input)
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div
        style={{
          ...panelStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '22px 24px',
        }}
      >
        <div>
          <p style={{ margin: 0, color: colors.muted, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Módulo</p>
          <h1 style={{ margin: '8px 0 0', fontSize: '2rem', color: colors.foreground }}>Directorio de proveedores</h1>
        </div>

        <button
          type="button"
          style={primaryButton}
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          Nuevo proveedor
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <div style={{ ...panelStyle, padding: '18px 20px' }}>
          <p style={{ margin: 0, color: colors.muted, fontSize: '0.8rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Total</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{proveedores.length}</h2>
        </div>
        <div style={{ ...panelStyle, padding: '18px 20px' }}>
          <p style={{ margin: 0, color: colors.muted, fontSize: '0.8rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Activos</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{totalActivos}</h2>
        </div>
        <div style={{ ...panelStyle, padding: '18px 20px' }}>
          <p style={{ margin: 0, color: colors.muted, fontSize: '0.8rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Inactivos</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{totalInactivos}</h2>
        </div>
      </div>

      <div style={{ ...panelStyle, padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(200px, 260px)', gap: '12px', marginBottom: '16px', alignItems: 'end' }}>
          <label style={{ display: 'grid', gap: '8px', fontWeight: 600, color: colors.foreground }}>
            Buscar por razón social o RUC
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ej. Distribuidora Andina"
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', fontWeight: 600, color: colors.foreground }}>
            Estado
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value as 'todos' | 'activo' | 'inactivo')}
              style={inputStyle}
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </label>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              background: colors.errorBg,
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#991B1B',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px',
            }}
          >
            <span>{error}</span>
            <button type="button" style={secondaryButton} onClick={() => void reload()}>
              Reintentar
            </button>
          </div>
        )}

        <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: colors.card }}>
            <thead style={{ background: '#F8FAFC' }}>
              <tr>
                <th style={tableHeadStyle}>RUC</th>
                <th style={tableHeadStyle}>Razón social</th>
                <th style={tableHeadStyle}>Categoría</th>
                <th style={tableHeadStyle}>Estado</th>
                <th style={tableHeadStyle}>Correo</th>
                <th style={tableHeadStyle}>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} style={{ padding: '18px', color: colors.muted, textAlign: 'center' }}>Cargando proveedores...</td>
                </tr>
              )}

              {!isLoading && filteredProveedores.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '18px', color: colors.muted, textAlign: 'center' }}>
                    {query || estado !== 'todos' ? 'No hay proveedores con esos filtros.' : 'No hay proveedores registrados.'}
                  </td>
                </tr>
              )}

              {!isLoading && filteredProveedores.map((proveedor) => (
                <tr
                  key={proveedor.id}
                  onClick={() => {
                    setEditing(proveedor)
                    setDialogOpen(true)
                  }}
                  style={{ cursor: 'pointer', borderTop: `1px solid ${colors.border}` }}
                >
                  <td style={tableCellStyle}>{proveedor.ruc}</td>
                  <td style={tableCellStyle}>{proveedor.razonSocial}</td>
                  <td style={tableCellStyle}>{proveedor.categoria}</td>
                  <td style={tableCellStyle}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: '999px',
                        padding: '6px 10px',
                        background: proveedor.estado === 'activo' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                        color: proveedor.estado === 'activo' ? '#047857' : '#475569',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        fontSize: '12px',
                      }}
                    >
                      {proveedor.estado}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{proveedor.email}</td>
                  <td style={tableCellStyle}>{proveedor.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProveedorFormDialog
        open={dialogOpen}
        proveedor={editing}
        onClose={() => {
          setEditing(null)
          setDialogOpen(false)
        }}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  )
}
