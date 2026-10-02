import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Package,
  Users,
  Truck,
  DollarSign,
  FileText,
  BarChart3,
  ShieldCheck,
  type LucideIcon, // <--- Agregamos 'type' aquí
} from 'lucide-react';

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Ventas',
    path: '/ventas',
    icon: ShoppingCart,
  },
  {
    title: 'Compras',
    path: '/compras',
    icon: ShoppingBag,
  },
  {
    title: 'Inventario',
    path: '/inventario',
    icon: Package,
  },
  {
    title: 'Clientes',
    path: '/clientes',
    icon: Users,
  },
  {
    title: 'Proveedores',
    path: '/proveedores',
    icon: Truck,
  },
  {
    title: 'Finanzas',
    path: '/finanzas',
    icon: DollarSign,
  },
  {
    title: 'Documentos',
    path: '/documentos',
    icon: FileText,
  },
  {
    title: 'Reportes',
    path: '/reportes',
    icon: BarChart3,
  },
  {
    title: 'Administración',
    path: '/administracion',
    icon: ShieldCheck,
  },
];