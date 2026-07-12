import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { finalPrice } from '@/lib/utils';
import type { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
  lastAddedId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  
  const [shippingFlat, setShippingFlat] = useState(79);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1499);

  // Load cart from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Fetch global shipping settings
  useEffect(() => {
    api.get<{ setting: { shippingFlat: number, freeShippingThreshold: number } }>('/settings')
      .then(res => {
        if (res.setting) {
          setShippingFlat(res.setting.shippingFlat);
          setFreeShippingThreshold(res.setting.freeShippingThreshold);
        }
      })
      .catch(console.error);
  }, []);

  // Save cart to local storage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, loaded]);

  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const add = (product: Product, quantity = 1) => {
    setItems((curr) => {
      const existing = curr.find((i) => i.product._id === product._id);
      if (existing) {
        return curr.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [...curr, { product, quantity: Math.min(quantity, product.stock) }];
    });
    setLastAddedId(product._id);
    setTimeout(() => setLastAddedId(null), 600);
  };

  const remove = (productId: string) => {
    setItems((curr) => curr.filter((i) => i.product._id !== productId));
  };

  const setQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((curr) =>
      curr.map((i) =>
        i.product._id === productId ? { ...i, quantity: Math.min(quantity, i.product.stock) } : i
      )
    );
  };

  const clear = () => setItems([]);

  const count = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + finalPrice(item.product) * item.quantity, 0);
  const shippingFee = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : shippingFlat;

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        remove,
        setQuantity,
        clear,
        count,
        subtotal,
        shippingFee,
        freeShippingThreshold,
        lastAddedId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
