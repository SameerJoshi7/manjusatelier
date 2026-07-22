import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Check, Lock, MapPin, ClipboardList, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { api } from '@/lib/api';
import { formatPrice, finalPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { Address } from '@/types';

const steps = ['Shipping', 'Review', 'Payment'] as const;

interface CreateOrderResponse {
  order: { id: string; customOrderId: string; amount: number; createdAt: string };
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
  const [activeOrder, setActiveOrder] = useState<CreateOrderResponse['order'] | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const [address, setAddress] = useState<Address>(user?.addresses?.[0] || {
    fullName: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [gender, setGender] = useState(user?.gender || '');

  useEffect(() => {
    if (user && !user.addresses?.length) {
      setAddress((a) => ({ ...a, fullName: a.fullName || user.name, phone: a.phone || user.phone || '' }));
    }
    if (user) {
      if (user.birthday) setBirthday(user.birthday);
      if (user.gender) setGender(user.gender);
    }
  }, [user]);

  useEffect(() => {
    if (step === 2 && activeOrder?.createdAt) {
      const targetTime = new Date(activeOrder.createdAt).getTime() + 5 * 60 * 1000;
      
      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
        setTimeLeft(remaining);
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [step, activeOrder]);

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

  // Allow them to see step 2 if they already created an order but haven't paid
  if (items.length === 0 && !activeOrder) {
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

  const placeOrder = async () => {
    setProcessing(true);
    try {
      if (user) {
        const isNewAddress = !user.addresses?.some(a => a.line1 === address.line1 && a.city === address.city);
        await api.put('/auth/profile', {
          birthday: birthday || undefined,
          gender: gender || undefined,
          phone: address.phone,
          addresses: isNewAddress ? [...(user.addresses || []), address] : user.addresses
        }).catch(() => {}); // ignore error
      }

      const { order } = await api.post<CreateOrderResponse>('/orders', {
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        shippingAddress: address,
        couponCode,
      });

      clear();
      setActiveOrder(order);
      setStep(2); // Move to Payment Screen
      window.scrollTo(0, 0);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Checkout failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const submitPayment = async () => {
    if (!activeOrder) return;
    if (utrNumber.trim().length !== 12) {
      notify('Please enter a valid 12-digit UTR number', 'error');
      return;
    }
    
    setProcessing(true);
    try {
      await api.post(`/orders/${activeOrder.id}/utr`, { utrNumber });
      notify('Payment details submitted successfully!');
      navigate(`/checkout/success/${activeOrder.id}`);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to submit payment details', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Generate dynamic UPI string
  // It reads your actual UPI ID from the environment variables (.env file)
  const upiId = import.meta.env.VITE_UPI_ID || "your_actual_upi_id@okbank"; 
  const merchantName = "Manjus Atelier";
  const upiString = activeOrder 
    ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&tr=${activeOrder.customOrderId}&am=${activeOrder.amount}&cu=INR&tn=${encodeURIComponent(`Order ${activeOrder.customOrderId}`)}`
    : '';

  return (
    <div className="container-x py-10">
      <h1 className="font-serif text-4xl text-brown-dark dark:text-beige">Checkout</h1>

      {/* Stepper */}
      <div className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => {
          const Icon = [MapPin, ClipboardList, QrCode][i];
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
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-brown-dark dark:text-beige">
                Shipping & Details
              </h2>
              
              {user?.addresses && user.addresses.length > 0 && (
                <Field label="Saved Addresses">
                  <select 
                    className="input mb-4" 
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        setAddress({ fullName: user.name, phone: user.phone || '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India' });
                      } else {
                        const selected = user.addresses![Number(e.target.value)];
                        setAddress({ ...selected, fullName: address.fullName || user.name, phone: address.phone || user.phone || '' });
                      }
                    }}
                  >
                    <option value="new">Add New Address</option>
                    {user.addresses.map((a, i) => (
                      <option key={i} value={i}>{a.line1}, {a.city}</option>
                    ))}
                  </select>
                </Field>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name">
                  <input className="input" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                </Field>
                <Field label="Mobile Number">
                  <input className="input" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Birthday">
                  <input type="date" className="input" value={birthday ? birthday.split('T')[0] : ''} onChange={(e) => setBirthday(e.target.value)} />
                </Field>
                <Field label="Gender">
                  <select className="input" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
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
                Review Order
              </Button>
            </div>
          )}

          {/* Step 1: Review */}
          {step === 1 && (
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
                <Button variant="secondary" size="lg" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button size="lg" onClick={placeOrder} disabled={processing}>
                  {processing ? 'Processing…' : `Confirm & Pay via UPI`}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && activeOrder && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-brown-dark dark:text-beige">
                Complete Payment
              </h2>

              {timeLeft === 0 ? (
                <div className="rounded-xl border border-red-500/20 bg-red-50 p-6 text-center text-red-900 dark:bg-red-500/10 dark:text-red-200">
                  <h3 className="font-serif text-xl font-medium">QR Code Expired</h3>
                  <p className="mt-2 text-sm opacity-90">
                    Your 5-minute window to scan the QR code has expired, and this order has been cancelled. 
                    Please return to your cart to create a new order.
                  </p>
                  <Button className="mt-6" onClick={() => navigate('/cart')}>
                    Return to Cart
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-red-500/20 bg-red-50 p-4 text-red-900 dark:bg-red-500/10 dark:text-red-200">
                    <div className="flex items-center justify-between font-medium">
                      <p>⚠️ Important: Keep your 12-digit UTR handy!</p>
                      {timeLeft !== null && (
                        <p className="text-red-700 dark:text-red-300 font-mono">
                          {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                          {(timeLeft % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                    </div>
                    <p className="mt-1 text-sm opacity-90">
                      After you scan and pay on your UPI app, you must enter the 12-digit UTR / Transaction ID below to verify your order before the timer runs out.
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-beige/5">
                    <div className="rounded-xl bg-white p-4 shadow-lift">
                      <QRCodeSVG value={upiString} size={200} />
                    </div>
                    
                    <div>
                      <p className="text-lg font-semibold text-brown-dark dark:text-beige">
                        Scan with any UPI App
                      </p>
                      <p className="text-sm text-brown/60 dark:text-beige/60">
                        GPay, PhonePe, Paytm, or BHIM
                      </p>
                      <p className="mt-4 font-serif text-3xl font-medium text-forest">
                        {formatPrice(activeOrder.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Field label="Enter 12-Digit UTR / Transaction ID">
                      <input 
                        className="input font-mono tracking-widest text-lg" 
                        placeholder="e.g. 123456789012"
                        maxLength={12}
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))} 
                      />
                    </Field>
                    <Button size="lg" fullWidth onClick={submitPayment} disabled={processing || utrNumber.length !== 12}>
                      {processing ? 'Verifying…' : 'Submit UTR & Finish Order'}
                    </Button>
                  </div>
                </>
              )}
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
                <dd>{formatPrice(activeOrder ? activeOrder.amount : total)}</dd>
              </div>
            </dl>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-brown/50 dark:text-beige/50">
              <Lock size={12} /> Secure UPI Payment.
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
