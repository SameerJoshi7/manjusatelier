import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Check, Lock, CreditCard, MapPin, ClipboardList } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { api } from '@/lib/api';
import { formatPrice, finalPrice, loadScript, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { Address } from '@/types';

const RAZORPAY_SDK = 'https://checkout.razorpay.com/v1/checkout.js';
const steps = ['Shipping', 'Payment', 'Review'] as const;

interface CreateOrderResponse {
  order: { id: string; amount: number; currency: string };
  razorpay: { orderId: string; amount: number; currency: string; keyId: string };
}

export default function Checkout() {
  usePageMeta({ title: "Checkout — Manju's Atelier" });
  const { items, subtotal, shippingFee, clear } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const couponCode = (location.state as { coupon?: string } | null)?.coupon;

  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState<Address>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  useEffect(() => {
    loadScript(RAZORPAY_SDK);
  }, []);

  useEffect(() => {
    if (user) setAddress((a) => ({ ...a, fullName: a.fullName || user.name, phone: a.phone || user.phone || '' }));
  }, [user]);

  const total = subtotal + shippingFee;

  if (!authLoading && !user) {
    return (
      <div className="container-x grid place-items-center py-24 text-center">
        <Lock className="text-brown" size={34} />
        <h1 className="mt-4 font-serif text-3xl text-brown-dark dark:text-beige">
          Please log in to checkout
        </h1>
        <Link to={`/login?redirect=/checkout`} className="mt-6">
          <Button size="lg">Log in / Register</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x grid place-items-center py-24 text-center">
        <h1 className="font-serif text-3xl text-brown-dark dark:text-beige">Your cart is empty</h1>
        <Link to="/shop" className="mt-6">
          <Button size="lg">Browse products</Button>
        </Link>
      </div>
    );
  }

  const addressValid =
    address.fullName && address.phone && address.line1 && address.city && address.postalCode;

  const pay = async () => {
    setProcessing(true);
    try {
      const ok = await loadScript(RAZORPAY_SDK);
      if (!ok || !window.Razorpay) throw new Error('Could not load payment gateway');

      const { order, razorpay } = await api.post<CreateOrderResponse>('/orders', {
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        shippingAddress: address,
        couponCode,
      });

      const rzp = new window.Razorpay({
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: "Manju's Atelier",
        description: 'Handcrafted with love',
        order_id: razorpay.orderId,
        prefill: { name: address.fullName, email: user?.email, contact: address.phone },
        theme: { color: '#8B5E3C' },
        handler: async (response: Record<string, string>) => {
          try {
            await api.post('/orders/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clear();
            notify('Payment successful!');
            navigate(`/checkout/success/${order.id}`);
          } catch (err) {
            notify(err instanceof Error ? err.message : 'Verification failed', 'error');
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      rzp.open();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Checkout failed', 'error');
      setProcessing(false);
    }
  };

  return (
    <div className="container-x py-10">
      <h1 className="font-serif text-4xl text-brown-dark dark:text-beige">Checkout</h1>

      {/* Stepper */}
      <div className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => {
          const Icon = [MapPin, CreditCard, ClipboardList][i];
          return (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  i <= step ? 'bg-brown text-cream' : 'bg-beige/50 text-brown/50'
                )}
              >
                {i < step ? <Check size={16} /> : <Icon size={16} />}
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn('h-px flex-1', i < step ? 'bg-brown' : 'bg-beige')} />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="card-surface p-6 md:p-8">
          {/* Step 1: Shipping */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-brown-dark dark:text-beige">
                Shipping Address
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name">
                  <input className="input" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <input className="input" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                </Field>
              </div>
              <Field label="Address Line 1">
                <input className="input" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
              </Field>
              <Field label="Address Line 2 (optional)">
                <input className="input" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City">
                  <input className="input" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                </Field>
                <Field label="State">
                  <input className="input" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                </Field>
                <Field label="PIN Code">
                  <input className="input" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
                </Field>
              </div>
              <Button size="lg" disabled={!addressValid} onClick={() => setStep(1)}>
                Continue to Payment
              </Button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-brown-dark dark:text-beige">
                Payment Method
              </h2>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-brown bg-beige/20 p-5">
                <CreditCard className="text-brown" />
                <div>
                  <p className="font-medium text-brown-dark dark:text-beige">
                    Razorpay Secure Checkout
                  </p>
                  <p className="text-sm text-brown/60 dark:text-beige/60">
                    Cards, UPI, Netbanking & Wallets
                  </p>
                </div>
                <Lock size={18} className="ml-auto text-forest" />
              </div>
              <p className="text-sm text-brown/60 dark:text-beige/60">
                You&apos;ll complete your payment securely via Razorpay when you place the order.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button size="lg" onClick={() => setStep(2)}>
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-serif text-2xl text-brown-dark dark:text-beige">
                Review Your Order
              </h2>
              <div className="rounded-xl bg-beige/30 p-4 text-sm dark:bg-beige/10">
                <p className="font-medium text-brown-dark dark:text-beige">{address.fullName}</p>
                <p className="text-brown/70 dark:text-beige/70">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} -{' '}
                  {address.postalCode}
                </p>
                <p className="text-brown/70 dark:text-beige/70">{address.phone}</p>
              </div>
              <div className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <div key={product._id} className="flex items-center gap-3">
                    <img src={product.images[0]} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brown-dark dark:text-beige">
                        {product.name}
                      </p>
                      <p className="text-xs text-brown/50">Qty: {quantity}</p>
                    </div>
                    <span className="text-sm font-medium">
                      {formatPrice(finalPrice(product) * quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button size="lg" onClick={pay} disabled={processing}>
                  <Lock size={16} /> {processing ? 'Processing…' : `Pay ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface p-6">
            <h2 className="font-serif text-xl text-brown-dark dark:text-beige">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-brown/60 dark:text-beige/60">Items ({items.length})</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brown/60 dark:text-beige/60">Shipping</dt>
                <dd>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</dd>
              </div>
              {couponCode && (
                <div className="flex justify-between text-forest">
                  <dt>Coupon {couponCode}</dt>
                  <dd>applied at payment</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-brown/10 pt-3 text-base font-semibold text-brown-dark dark:text-beige">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-brown/50 dark:text-beige/50">
              <Lock size={12} /> Secured by Razorpay. Final total (incl. coupon) confirmed at
              payment.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brown-dark dark:text-beige">
        {label}
      </span>
      {children}
    </label>
  );
}
