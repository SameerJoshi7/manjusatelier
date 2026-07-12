import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'manjus_wishlist';

interface WishlistState {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
}

const WishlistContext = createContext<WishlistState | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // Sync from server wishlist when logged in.
  useEffect(() => {
    if (user?.wishlist) setIds(user.wishlist);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const has = (id: string) => ids.includes(id);

  const toggle = (id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    if (user) {
      api.post(`/auth/wishlist/${id}`).catch(() => void 0);
    }
  };

  return (
    <WishlistContext.Provider value={{ ids, has, toggle }}>{children}</WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
