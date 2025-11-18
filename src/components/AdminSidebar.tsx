import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAdminRoutes } from '@/hooks/useAdminRoutes';
import { useAuthContext } from '@/components/AuthProvider';
import { PanelLeftClose, PanelLeftOpen, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';

/**
 * AdminSidebar - Glassmorphism navigation sidebar with role-based visibility
 * @component
 */
export const AdminSidebar = () => {
  const { state, toggleSidebar } = useSidebar();
  const { routesBySection } = useAdminRoutes();
  const { user, role, signOut } = useAuthContext();
  const { theme, setTheme } = useTheme();

  const isCollapsed = state === 'collapsed';

  const renderSection = (title: string, routes: ReturnType<typeof useAdminRoutes>['routesBySection']['public']) => {
    if (routes.length === 0) return null;

    return (
      <div className="mb-6">
        {!isCollapsed && (
          <h3 className="mb-2 px-4 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
            {title}
          </h3>
        )}
        <nav className="space-y-1 px-2">
          {routes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              end={route.path === '/'}
              className={cn(
                "glass-nav-item flex items-center gap-3 rounded-lg px-3 py-2.5",
                "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                isCollapsed && "justify-center px-2"
              )}
              activeClassName="active"
            >
              <route.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium flex-1">{route.label}</span>
              )}
              {!isCollapsed && route.badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  {route.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "glass-morph-solid fixed left-0 top-0 z-40 h-screen flex flex-col",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header with toggle */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <h2 className="text-lg font-bold text-sidebar-foreground">
            AdTopia
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="glass-nav-item"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Scrollable navigation */}
      <ScrollArea className="flex-1 py-4">
        {renderSection('Navigation', routesBySection.public)}
        {renderSection('Dashboard', routesBySection.user)}
        {renderSection('Admin Panel', routesBySection.admin)}
        {renderSection('Super Admin', routesBySection.super_admin)}
      </ScrollArea>

      {/* Bottom section - Theme + User */}
      <div className="border-t border-sidebar-border p-4 space-y-2">
        <Button
          variant="ghost"
          size={isCollapsed ? 'icon' : 'default'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn("glass-nav-item w-full justify-start", isCollapsed && "px-2 justify-center")}
        >
          {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          {!isCollapsed && <span className="ml-3">Toggle Theme</span>}
        </Button>
        <Button
          variant="ghost"
          size={isCollapsed ? 'icon' : 'default'}
          onClick={signOut}
          className={cn("glass-nav-item w-full justify-start text-destructive hover:text-destructive", isCollapsed && "px-2 justify-center")}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
        {!isCollapsed && (
          <div className="glass-morph p-3 rounded-lg border border-white/10">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email ?? 'Guest'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                {role ?? 'No role'}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

