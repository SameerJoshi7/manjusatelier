import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Ticket,
  LogOut,
  Menu,
  X,
  Store,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageLoader } from '@/components/ui/PageLoader';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  usePageMeta({ title: "Admin — Manju's Atelier" });

  if (loading) return <PageLoader />;

  if (!user || user.role !== 'admin') {
    return (
      <div className="grid min-h-screen place-items-center bg-cream px-6 text-center dark:bg-[#1c1712]">
        <div>
          <h1 className="font-serif text-3xl text-brown-dark dark:text-beige">
            Admin access required
          </h1>
          <p className="mt-2 text-brown/60 dark:text-beige/60">
            Please log in with an administrator account to continue.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login?redirect=/admin"
              className="btn bg-brown px-6 py-3 text-sm text-cream hover:bg-brown-dark"
            >
              Log in
            </Link>
            <Link
              to="/"
              className="btn border border-brown/30 px-6 py-3 text-sm text-brown hover:bg-brown/10"
            >
              Back to store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const SidebarContent = (
    <>
      <Link to="/admin" className="flex items-center gap-2.5 px-2">
        <img src="/logo-256.png" alt="" className="h-10 w-10 rounded-full ring-1 ring-gold/40" />
        <div>
          <p className="font-serif text-lg leading-none text-brown-dark dark:text-beige">
            Manju&apos;s Atelier
          </p>
          <p className="text-xs text-brown/50 dark:text-beige/50">Admin Panel</p>
        </div>
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brown text-cream'
                  : 'text-brown-dark hover:bg-beige/50 dark:text-beige dark:hover:bg-beige/10'
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-brown/10 pt-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-brown-dark hover:bg-beige/50 dark:text-beige dark:hover:bg-beige/10"
        >
          <Store size={18} /> View Store
        </Link>
        <button
          onClick={() => logout().then(() => navigate('/'))}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream dark:bg-[#1c1712]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-brown/10 bg-white p-4 dark:bg-[#26201a] lg:flex">
        {SidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-brown/10 bg-white p-4 dark:bg-[#26201a] lg:hidden">
        <span className="font-serif text-lg text-brown-dark dark:text-beige">Admin Panel</span>
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brown-dark/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white p-4 dark:bg-[#26201a]">
            <button
              onClick={() => setOpen(false)}
              className="mb-4 self-end text-brown-dark dark:text-beige"
              aria-label="Close menu"
            >
              <X />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
