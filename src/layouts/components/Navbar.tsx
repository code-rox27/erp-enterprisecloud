import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground hidden sm:block">
          ERP EnterpriseCloud
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive"></span>
        </button>

        <div className="h-6 w-[1px] bg-border" />

        <div className="flex items-center gap-3 pl-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-foreground leading-none">
              {user?.name || 'Usuario ERP'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.role || 'Administrador'}
            </p>
          </div>

          <button
            onClick={logout}
            className="ml-2 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};