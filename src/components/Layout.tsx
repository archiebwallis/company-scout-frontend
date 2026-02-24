import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

export function Layout() {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
