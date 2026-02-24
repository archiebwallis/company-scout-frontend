import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, SlidersHorizontal, History, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/runs/new', icon: PlusCircle, label: 'New Run' },
  { to: '/configs', icon: SlidersHorizontal, label: 'Scoring Configs' },
  { to: '/runs', icon: History, label: 'Runs' },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    if (to === '/runs/new') return location.pathname === '/runs/new';
    if (to === '/runs') return location.pathname.startsWith('/runs') && location.pathname !== '/runs/new';
    return location.pathname.startsWith(to);
  };

  return (
    <aside className="w-60 shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col min-h-screen">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-base font-bold text-foreground tracking-tight">Portfolio Scoring</h1>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive(item.to)
                ? 'bg-sidebar-accent text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
