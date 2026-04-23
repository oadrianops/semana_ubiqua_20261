import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plug, LineChart, DollarSign, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './Logo';
import { useAuthStore } from '../store/auth';
import { cn } from '../lib/cn';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/conectar', icon: Plug, label: 'Conectar Banco' },
  { to: '/app/score', icon: LineChart, label: 'Meu NanScore' },
  { to: '/app/credito', icon: DollarSign, label: 'Crédito' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-nan-light">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex-col">
        <Link to="/app" className="px-6 py-6 border-b border-gray-100">
          <Logo />
        </Link>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors',
                  isActive
                    ? 'bg-nan-primary-light text-nan-primary-dark'
                    : 'text-nan-gray hover:bg-gray-50 hover:text-nan-dark'
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="px-3 py-2 mb-2">
            <div className="font-semibold text-sm truncate">{user?.name}</div>
            <div className="text-xs text-nan-gray truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-nan-gray hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 bg-white border-b border-gray-100 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo size="sm" />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="border-t border-gray-100 p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium',
                    isActive
                      ? 'bg-nan-primary-light text-nan-primary-dark'
                      : 'text-nan-gray'
                  )
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600"
            >
              <LogOut size={18} /> Sair
            </button>
          </nav>
        )}
      </header>

      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 py-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
