import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../config/navigation';
import { Layers } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar = ({ collapsed }: SidebarProps) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Branding / Isotipo Header */}
      <div className="flex h-16 items-center border-b border-border px-4 gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shrink-0">
          <Layers className="h-6 w-6" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <span className="font-bold text-foreground text-base tracking-wide">Enterprise</span>
            <span className="text-xs text-primary font-semibold block leading-none">CLOUD ERP</span>
          </div>
        )}
      </div>

      {/* Lista de Navegación por Módulos */}
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
              title={collapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.title}</span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};