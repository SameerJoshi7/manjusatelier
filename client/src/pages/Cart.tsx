import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { api } from '@/lib/api';
import { formatPrice, finalPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function Cart() {
  usePageMeta({ title: "Cart — Manju's Atelier" });
  const { items, setQuantity, remove, subtotal, shippingFee, freeShippingThreshold } = useCart();
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [applying, setApplying] = useState(false);
  const { notify } = useToast();
  const navigate = useNavigate();

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplying(true);
    try {
      const res = await api.post<{ code: string; discount: number }>('/coupons/validate', {
        code: coupon,
        subtotal,
      });
      setApplied({ code: res.code, discount: res.discount });
      notify(`Coupon ${res.code} applied!`);
    } catch (err) {
      setApplied(null);
      notify(err instanceof Error ? err.message : 'Invalid coupon', 'error');
    } finally {
      setApplying(false);
    }
  };

  const discount = applied?.discount ?? 0;
  const total = Math.max(0, subtotal - discount) + shippingFee;
  const remaining = freeShippingThreshold - subtotal;

  if (items.length === 0) {
    return (
      <div className="container-x grid place-items-center py-24 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-beige/50 text-brown">
          <ShoppingBag size={34} />
        </span>
        <h1 className="mt-6 font-serif text-3xl text-brown-dark dark:text-beige">
          Your cart is empty
        </h1>
        <p className="mt-2 text-brown/60 dark:text-beige/60">
          Discover something handmade to fall in love with.
        </p>
        <Link to="/shop" className="mt-6">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <h1 className="font-serif text-4xl text-brown-dark dark:text-beige">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-4">
          {subtotal < freeShippingThreshold && (
            <div className="rounded-xl bg-forest/10 p-4 text-sm text-forest-dark dark:text-forest">
              Add <strong>{formatPrice(remaining)}</strong> more to unlock free shipping!
            </div>
          )}
          <AnimatePresence>
            {items.map(({ product, quantity }) => (
              <motion.div
                key={product._id}
                layout
                exit={{ opacity: 0, x: -20 }}
                className="card-surface flex gap-4 p-4"
              >
                <Link to={`/product/${product.slug}`} className="shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-serif text-lg text-brown-dark dark:text-beige">
                        {product.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => remove(product._id)}
                      aria-label="Remove"
                      className="text-brown/40 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-brown/50 dark:text-beige/50">
                    {formatPrice(finalPrice(product))} each
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-brown/20">
                      <button
                        onClick={() => setQuantity(product._id, quantity - 1)}
                        className="grid h-9 w-9 place-items-center rounded-full hover:bg-beige/40"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(product._id, quantity + 1)}
                        className="grid h-9 w-9 place-items-center rounded-full hover:bg-beige/40"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-semibold text-brown-dark dark:text-beige">
                      {formatPrice(finalPrice(product) * quantity)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface p-6">
            <h2 className="font-serif text-2xl text-brown-dark dark:text-beige">Order Summary</h2>

            {/* Coupon */}
            <div className="mt-5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40" />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="w-full rounded-full border border-brown/15 bg-cream py-2.5 pl-9 pr-3 text-sm uppercase outline-none focus:border-brown dark:bg-[#1c1712]"
                  />
                </div>
                <Button size="sm" onClick={applyCoupon} disabled={applying}>
                  Apply
                </Button>
              </div>
              <p className="mt-2 text-xs text-brown/50 dark:text-beige/50">
                Try <strong>WELCOME10</strong> or <strong>FLAT200</strong>
              </p>
            </div>

            <dl className="mt-5 space-y-3 border-t border-brown/10 pt-5 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              {discount > 0 && (
                <Row label={`Discount (${applied?.code})`} value={`-${formatPrice(discount)}`} accent />
              )}
              <Row label="Shipping" value={shippingFee === 0 ? 'Free' : formatPrice(shippingFee)} />
              <div className="flex justify-between border-t border-brown/10 pt-3 text-base font-semibold text-brown-dark dark:text-beige">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            <Button
              size="lg"
              fullWidth
              className="mt-6"
              onClick={() =>
                navigate('/checkout', { state: { coupon: applied?.code } })
              }
            >
              Checkout <ArrowRight size={18} />
            </Button>
            <Link
              to="/shop"
              className="mt-3 block text-center text-sm text-brown/60 hover:text-brown dark:text-beige/60"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-brown/60 dark:text-beige/60">{label}</dt>
      <dd className={accent ? 'font-medium text-forest' : 'text-brown-dark dark:text-beige'}>
        {value}
      </dd>
    </div>
  );
}
