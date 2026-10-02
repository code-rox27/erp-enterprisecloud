# ERP Enterprise Cloud — Frontend Web

Sistema Web Empresarial ERP modular desarrollado con React, TypeScript, Vite y Tailwind CSS.

---

## Requisitos Previos e Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSOTORIO>
   cd erp-enterprisecloud-frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

---

## 🎨 Paleta de Colores y Tokens CSS (Enterprise Navy & Slate)

El sistema utiliza variables CSS globales mapeadas en Tailwind CSS. Al construir componentes, **utiliza las clases semánticas** en lugar de colores arbitrarios.

| Elemento | Variable / Clase | Color Hex | Uso |
| :--- | :--- | :--- | :--- |
| **Fondo Principal** | `bg-background` | `#F8FAFC` | Fondo de pantallas y vistas |
| **Superficie / Cards** | `bg-card` | `#FFFFFF` | Tarjetas, tablas, modales |
| **Primario** | `bg-primary` | `#2563EB` | Botones principales, acentos |
| **Texto Principal** | `text-foreground` | `#020817` | Títulos y texto general |
| **Texto Secundario**| `text-muted-foreground` | `#64748B` | Labels, subtítulos, placeholders |
| **Bordes** | `border-border` | `#E2E8F0` | Bordes de tablas, inputs, divisiones |
| **Éxito (Stock/Pago)**| `text-emerald-600` | `#10B981` | Aprobado, en regla, stock suficiente |
| **Peligro / Error** | `bg-destructive` | `#EF4444` | Eliminar, anulado, error |

---

## 📁 Arquitectura de Carpetas (`src/`)

```text
src/
├── components/      # UI global (ui/) y Feedback (feedback/)
├── config/          # Variables de entorno y constantes
├── context/         # Estados globales React
├── hooks/           # Custom hooks reutilizables
├── layouts/         # Contenedores principales (Sidebar, Navbar, AppShell)
├── modules/         # Módulos de negocio (ventas, compras, inventario, etc.)
├── routes/          # Configuración de React Router y Guards
├── services/        # Cliente HTTP (Axios/Fetch) e integración con API REST
├── types/           # Definiciones de TypeScript (.d.ts / interfaces)
└── utils/           # Funciones puras de formato, fechas y validaciones
```

---

## 🌿 Flujo de Trabajo en Git

1. **Rama principal:** `main` (solo código probado y estable).
2. **Ramas de trabajo:** Crear una rama por cada funcionalidad usando la convención:
   - `feat/nombre-funcionalidad` (Ejemplo: `feat/layout-sidebar`, `feat/modulo-compras`).
   - `fix/descripcion-error` (Ejemplo: `fix/tabla-inventario-paginacion`).
3. **Commits descriptivos:**
   - `feat: agregar componente de tabla paginada`
   - `fix: corregir validacion en formulario de cliente`