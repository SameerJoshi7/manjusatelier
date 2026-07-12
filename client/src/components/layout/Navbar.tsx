import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCategories } from '@/hooks/useCategories';
import { InstallPWA } from '@/components/ui/InstallPWA';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const { count, lastAddedId } = useCart();
  const { ids } = useWishlist();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { categories } = useCategories();

  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled && !mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        transparent
          ? 'bg-transparent'
          : 'bg-cream/90 shadow-soft backdrop-blur-md dark:bg-[#1c1712]/90'
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-4 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logo-256.png"
            alt="Manju's Atelier logo"
            width={44}
            height={44}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-gold/40 md:h-11 md:w-11"
          />
          <span
            className={cn(
              'font-serif text-xl leading-none md:text-2xl',
              transparent ? 'text-white' : 'text-brown-dark dark:text-beige'
            )}
          >
            Manju&apos;s Atelier
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li
              key={link.to}
              onMouseEnter={() => link.label === 'Categories' && setMegaOpen(true)}
              onMouseLeave={() => link.label === 'Categories' && setMegaOpen(false)}
              className="relative"
            >
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    transparent
                      ? 'text-white/90 hover:text-white'
                      : 'text-brown-dark hover:text-brown dark:text-beige',
                    isActive && !transparent && 'text-brown'
                  )
                }
              >
                {link.label}
                {link.label === 'Categories' && <ChevronDown size={14} />}
              </NavLink>

              {/* Mega menu */}
              {link.label === 'Categories' && (
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-1/2 top-full w-[520px] -translate-x-1/2 pt-3"
                    >
                      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-3 shadow-lift dark:bg-[#26201a]">
                        {categories.map((c) => (
                          <Link
                            key={c._id}
                            to={`/shop?category=${c.slug}`}
                            className="flex flex-col rounded-xl px-4 py-3 transition-colors hover:bg-beige/40 dark:hover:bg-beige/10"
                          >
                            <span className="font-medium text-brown-dark dark:text-beige">
                              {c.name}
                            </span>
                            <span className="text-xs text-brown/50 dark:text-beige/50">
                              {c.productCount ?? 0} items
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <IconButton label="Search" transparent={transparent} onClick={() => setSearchOpen((v) => !v)}>
            <Search size={20} />
          </IconButton>

          <IconButton label="Theme" transparent={transparent} onClick={toggle}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </IconButton>

          <Link to="/wishlist" className="relative">
            <IconButton label="Wishlist" transparent={transparent}>
              <Heart size={20} />
              {ids.length > 0 && <Counter value={ids.length} />}
            </IconButton>
          </Link>

          <Link to="/cart" className="relative">
            <IconButton label="Cart" transparent={transparent}>
              <motion.span
                key={lastAddedId}
                animate={lastAddedId ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <ShoppingBag size={20} />
              </motion.span>
              {count > 0 && <Counter value={count} />}
            </IconButton>
          </Link>

          {/* Profile */}
          <div className="group relative hidden md:block">
            <IconButton label="Account" transparent={transparent}>
              <User size={20} />
            </IconButton>
            <div className="invisible absolute right-0 top-full w-48 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="rounded-2xl bg-white p-2 shadow-lift dark:bg-[#26201a]">
                {user ? (
                  <>
                    <p className="px-3 py-2 text-sm text-brown/60 dark:text-beige/60">
                      Hi, {user.name.split(' ')[0]}
                    </p>
                    <Link to="/account" className="menu-item">
                      My Orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="menu-item">
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={logout} className="menu-item flex w-full items-center gap-2">
                      <LogOut size={15} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="menu-item">
                      Login
                    </Link>
                    <Link to="/login?mode=register" className="menu-item">
                      Create account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            className={cn(
              'ml-1 rounded-full p-2 lg:hidden',
              transparent ? 'text-white' : 'text-brown-dark dark:text-beige'
            )}
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-brown/10 bg-cream dark:bg-[#1c1712]"
          >
            <form onSubmit={submitSearch} className="container-x flex items-center gap-3 py-4">
              <Search size={20} className="text-brown/50" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search handmade treasures…"
                className="flex-1 bg-transparent text-brown-dark outline-none placeholder:text-brown/40 dark:text-beige"
              />
              <button type="submit" className="btn bg-brown px-5 py-2 text-sm text-cream">
                Search
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-cream lg:hidden dark:bg-[#1c1712]"
          >
            <ul className="container-x flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className="block rounded-xl px-4 py-3 text-brown-dark hover:bg-beige/40 dark:text-beige dark:hover:bg-beige/10"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li className="mt-2 border-t border-brown/10 pt-4 px-4 pb-2">
                <InstallPWA className="w-full justify-center" />
              </li>
              <li className="border-t border-brown/10 pt-2">
                {user ? (
                  <button
                    onClick={logout}
                    className="block w-full rounded-xl px-4 py-3 text-left text-brown-dark dark:text-beige"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="block rounded-xl px-4 py-3 text-brown-dark dark:text-beige"
                  >
                    Login / Register
                  </Link>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function IconButton({
  children,
  label,
  transparent,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  transparent: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'relative rounded-full p-2 transition-colors',
        transparent
          ? 'text-white hover:bg-white/15'
          : 'text-brown-dark hover:bg-brown/10 dark:text-beige dark:hover:bg-beige/10'
      )}
    >
      {children}
    </button>
  );
}

function Counter({ value }: { value: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-brown-dark">
      {value}
    </span>
  );
}
