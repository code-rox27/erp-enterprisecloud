import { useMemo, useState, type CSSProperties } from 'react'
import { ContactosDialog } from '@/modules/proveedores/components/ContactosDialog'
import { ProveedorFormDialog } from '@/modules/proveedores/components/ProveedorFormDialog'
import { useProveedores } from '@/modules/proveedores/hooks/useProveedores'
import type { Proveedor, ProveedorInput } from '@/types/proveedor'

const colors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#2563EB',
  primarySoft: '#EFF6FF',
  foreground: '#020817',
  muted: '#64748B',
  border: '#E2E8F0',
  errorBg: '#FEF2F2',
  successBg: '#ECFDF5',
  successText: '#047857',
  infoBg: '#EFF6FF',
  warningBg: '#FFFBEB',
  warningText: '#B45309',
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

const tabs: Array<{ id: 'datos' | 'contactos' | 'historial' | 'creditos' | 'cuenta'; label: string }> = [
  { id: 'datos', label: 'Datos' },
  { id: 'contactos', label: 'Contactos' },
  { id: 'historial', label: 'Historial' },
  { id: 'creditos', label: 'Créditos' },
  { id: 'cuenta', label: 'Estado de cuenta' },
]

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(value))

export function ProveedoresPage() {
  const { proveedores, isLoading, error, reload, create, update, toggleEstado, addContacto, removeContacto } = useProveedores()
  const [query, setQuery] = useState('')
  const [estado, setEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [contactsProvider, setContactsProvider] = useState<Proveedor | null>(null)
  const [editing, setEditing] = useState<Proveedor | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'datos' | 'contactos' | 'historial' | 'creditos' | 'cuenta'>('datos')

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

  const selectedProveedor = useMemo(
    () => proveedores.find((proveedor) => proveedor.id === selectedId) ?? null,
    [proveedores, selectedId],
  )

  const totalActivos = proveedores.filter((p) => p.estado === 'activo').length
  const totalInactivos = proveedores.filter((p) => p.estado === 'inactivo').length

  const handleCreateOrUpdate = async (input: ProveedorInput) => {
    if (editing) {
      await update(editing.id, input)
      return
    }

    await create(input)
  }

  const historial = selectedProveedor
    ? [
        { label: 'Registro', value: formatDate(selectedProveedor.creadoEn), detail: 'Proveedor registrado en el sistema' },
        { label: 'Último contacto', value: selectedProveedor.contactos.length ? selectedProveedor.contactos[0].nombre : 'Sin contacto principal', detail: selectedProveedor.contactos.length ? selectedProveedor.contactos[0].cargo : 'Sin asignación' },
        { label: 'Compras', value: '12 ordenes', detail: 'Último movimiento hace 4 días' },
        { label: 'Pagos', value: 'S/. 28,400.00', detail: 'Pago total del período actual' },
      ]
    : []

  const renderDetailContent = () => {
    if (!selectedProveedor) {
      return (
        <div style={{ display: 'grid', gap: '12px', padding: '28px 18px' }}>
          <p style={{ margin: 0, fontWeight: 700, color: colors.foreground }}>Selecciona un proveedor</p>
          <p style={{ margin: 0, color: colors.muted }}>Haz clic en una fila para ver sus datos, contactos, historial y cuentas.</p>
        </div>
      )
    }

    if (activeTab === 'datos') {
      return (
        <div style={{ display: 'grid', gap: '14px' }}>
          <div style={{ display: 'grid', gap: '10px', background: colors.primarySoft, borderRadius: '12px', padding: '14px', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <strong style={{ fontSize: '1rem' }}>{selectedProveedor.razonSocial}</strong>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '999px',
                  padding: '6px 10px',
                  background: selectedProveedor.estado === 'activo' ? colors.successBg : 'rgba(100, 116, 139, 0.12)',
                  color: selectedProveedor.estado === 'activo' ? colors.successText : '#475569',
                  fontWeight: 700,
                  fontSize: '12px',
                  textTransform: 'capitalize',
                }}
              >
                {selectedProveedor.estado}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <div>
                <p style={{ margin: '0 0 4px', color: colors.muted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>RUC</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedProveedor.ruc}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: colors.muted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Categoría</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedProveedor.categoria}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: colors.muted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Correo</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedProveedor.email}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: colors.muted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Teléfono</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedProveedor.telefono}</p>
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', color: colors.muted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dirección</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{selectedProveedor.direccion}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              style={{ ...secondaryButton, background: colors.card }}
              onClick={() => {
                setEditing(selectedProveedor)
                setDialogOpen(true)
              }}
            >
              Editar datos
            </button>
            <button
              type="button"
              style={{ ...secondaryButton, background: colors.card }}
              onClick={() => void toggleEstado(selectedProveedor)}
            >
              {selectedProveedor.estado === 'activo' ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>
      )
    }

    if (activeTab === 'contactos') {
      return (
        <div style={{ display: 'grid', gap: '12px' }}>
          {selectedProveedor.contactos.length === 0 ? (
            <div style={{ border: '1px dashed #CBD5E1', borderRadius: '12px', padding: '20px', textAlign: 'center', color: colors.muted }}>
              Este proveedor aún no tiene contactos registrados.
            </div>
          ) : (
            selectedProveedor.contactos.map((contacto) => (
              <div key={contacto.id} style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '12px 14px', display: 'grid', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                  <strong>{contacto.nombre}</strong>
                  {contacto.principal && (
                    <span style={{ background: colors.infoBg, color: '#1D4ED8', borderRadius: '999px', padding: '4px 8px', fontSize: '11px', fontWeight: 700 }}>
                      Principal
                    </span>
                  )}
                </div>
                <span style={{ color: colors.muted }}>{contacto.cargo}</span>
                <span style={{ color: colors.muted }}>{contacto.email}</span>
                <span style={{ color: colors.muted }}>{contacto.telefono}</span>
              </div>
            ))
          )}

          <button
            type="button"
            style={primaryButton}
            onClick={() => {
              setContactsProvider(selectedProveedor)
            }}
          >
            Gestionar contactos
          </button>
        </div>
      )
    }

    if (activeTab === 'historial') {
      return (
        <div style={{ display: 'grid', gap: '12px' }}>
          {historial.map((item) => (
            <div key={item.label} style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '12px 14px', display: 'grid', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                <strong>{item.label}</strong>
                <span style={{ color: colors.muted, fontSize: '12px' }}>{item.value}</span>
              </div>
              <span style={{ color: colors.muted, fontSize: '13px' }}>{item.detail}</span>
            </div>
          ))}
        </div>
      )
    }

    if (activeTab === 'creditos') {
      return (
        <div style={{ display: 'grid', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
            <div style={{ background: colors.warningBg, borderRadius: '12px', padding: '14px', border: `1px solid ${colors.border}` }}>
              <p style={{ margin: '0 0 6px', color: colors.warningText, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Límite</p>
              <strong style={{ fontSize: '1.4rem', color: colors.foreground }}>S/. 35,000</strong>
            </div>
            <div style={{ background: colors.successBg, borderRadius: '12px', padding: '14px', border: `1px solid ${colors.border}` }}>
              <p style={{ margin: '0 0 6px', color: colors.successText, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disponible</p>
              <strong style={{ fontSize: '1.4rem', color: colors.foreground }}>S/. 12,800</strong>
            </div>
          </div>

          <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '14px', display: 'grid', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ color: colors.muted }}>Crédito usado</span>
              <strong>S/. 22,200</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ color: colors.muted }}>Vencidos</span>
              <strong>S/. 0.00</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ color: colors.muted }}>Próximos vencimientos</span>
              <strong>3 cuotas</strong>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={{ display: 'grid', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
          <div style={{ background: colors.primarySoft, borderRadius: '12px', padding: '14px', border: `1px solid ${colors.border}` }}>
            <p style={{ margin: '0 0 6px', color: colors.muted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo</p>
            <strong style={{ fontSize: '1.5rem' }}>S/. 18,450</strong>
          </div>
          <div style={{ background: colors.successBg, borderRadius: '12px', padding: '14px', border: `1px solid ${colors.border}` }}>
            <p style={{ margin: '0 0 6px', color: colors.successText, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pagado</p>
            <strong style={{ fontSize: '1.5rem' }}>S/. 32,560</strong>
          </div>
        </div>

        <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '14px', display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ color: colors.muted }}>Por vencer</span>
            <strong>S/. 4,900</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ color: colors.muted }}>Vencidos</span>
            <strong>S/. 0.00</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ color: colors.muted }}>Último movimiento</span>
            <strong>02 oct 2026</strong>
          </div>
        </div>
      </div>
    )
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, 0.95fr)', gap: '20px' }}>
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

                {!isLoading && filteredProveedores.map((proveedor) => {
                  const isSelected = selectedProveedor?.id === proveedor.id

                  return (
                    <tr
                      key={proveedor.id}
                      onClick={() => setSelectedId(proveedor.id)}
                      style={{
                        cursor: 'pointer',
                        borderTop: `1px solid ${colors.border}`,
                        background: isSelected ? '#F8FAFF' : 'transparent',
                      }}
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <aside style={{ ...panelStyle, padding: '18px 18px 16px' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: colors.foreground }}>Detalle del proveedor</h3>
              {selectedProveedor && (
                <button
                  type="button"
                  style={{ ...secondaryButton, padding: '7px 10px', fontSize: '12px' }}
                  onClick={() => {
                    setEditing(selectedProveedor)
                    setDialogOpen(true)
                  }}
                >
                  Editar
                </button>
              )}
            </div>

            {selectedProveedor ? (
              <>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: `1px solid ${colors.border}`, paddingBottom: '8px' }}>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        border: 'none',
                        borderRadius: '999px',
                        padding: '8px 12px',
                        background: activeTab === tab.id ? colors.primary : '#F1F5F9',
                        color: activeTab === tab.id ? '#FFFFFF' : colors.foreground,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {renderDetailContent()}
              </>
            ) : (
              <div style={{ padding: '12px 8px', color: colors.muted }}>No hay proveedor seleccionado.</div>
            )}
          </div>
        </aside>
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

      <ContactosDialog
        proveedor={contactsProvider}
        onClose={() => setContactsProvider(null)}
        onAdd={addContacto}
        onRemove={removeContacto}
      />
    </div>
  )
}
