import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { CartItem, Product } from '@/types';
import { finalPrice } from '@/lib/utils';

const STORAGE_KEY = 'manjus_cart';
const SHIPPING_FLAT = 79;
const FREE_SHIPPING_THRESHOLD = 1499;

interface CartState {
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

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add: CartState['add'] = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
    setLastAddedId(product._id);
    setTimeout(() => setLastAddedId(null), 600);
  };

  const remove: CartState['remove'] = (id) =>
    setItems((prev) => prev.filter((i) => i.product._id !== id));

  const setQuantity: CartState['setQuantity'] = (id, quantity) =>
    setItems((prev) =>
      prev
        .map((i) =>
          i.product._id === id
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.product.stock)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );

  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + finalPrice(i.product) * i.quantity, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;

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
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        lastAddedId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
