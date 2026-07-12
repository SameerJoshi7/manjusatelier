import { useState } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/Button';
import { Search, CheckCircle2, Clock, Package, Truck, AlertCircle } from 'lucide-react';

export default function OrderTracking() {
  usePageMeta({ title: 'Track Order — Manju\'s Atelier' });
  const [orderId, setOrderId] = useState('');
  const [tracking, setTracking] = useState(false);

  // This is a placeholder for the actual API call
  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) setTracking(true);
  };

  return (
    <div className="container-x py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-brown-dark md:text-4xl dark:text-beige">
            Track Your Order
          </h1>
          <p className="mt-3 text-brown/70 dark:text-beige/70">
            Enter your Order ID (e.g. ORD-1045) to see the real-time status of your handcrafted items.
          </p>
        </div>

        <form onSubmit={handleTrack} className="mt-8 flex gap-3">
          <input
            type="text"
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="input flex-1 font-mono uppercase"
          />
          <Button type="submit" disabled={!orderId.trim()}>
            <Search size={18} className="mr-2" /> Track
          </Button>
        </form>

        {tracking && (
          <div className="mt-12 rounded-2xl bg-white p-6 shadow-soft dark:bg-beige/5 md:p-8">
            <div className="flex items-center justify-between border-b border-brown/10 pb-4">
              <div>
                <p className="text-sm text-brown/60 dark:text-beige/60">Order ID</p>
                <p className="font-mono text-lg font-bold text-brown-dark dark:text-beige">
                  {orderId.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-brown/60 dark:text-beige/60">Expected Delivery</p>
                <p className="font-medium text-forest">3-5 Days</p>
              </div>
            </div>

            <div className="mt-8 space-y-8 pl-4">
              {/* Timeline Items */}
              <div className="relative flex gap-6">
                <div className="absolute -bottom-8 left-3 top-8 w-px bg-forest" />
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h3 className="font-semibold text-brown-dark dark:text-beige">Order Placed</h3>
                  <p className="text-sm text-brown/60 dark:text-beige/60">We received your order.</p>
                </div>
              </div>

              <div className="relative flex gap-6">
                <div className="absolute -bottom-8 left-3 top-8 w-px bg-forest" />
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h3 className="font-semibold text-brown-dark dark:text-beige">Payment Verified</h3>
                  <p className="text-sm text-brown/60 dark:text-beige/60">UTR was successfully verified.</p>
                </div>
              </div>

              <div className="relative flex gap-6">
                <div className="absolute -bottom-8 left-3 top-8 w-px bg-brown/20" />
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-brown-dark shadow-sm">
                  <Clock size={14} />
                </div>
                <div>
                  <h3 className="font-semibold text-brown-dark dark:text-beige">Crafting in Progress</h3>
                  <p className="text-sm text-brown/60 dark:text-beige/60">Manju is handcrafting your items.</p>
                </div>
              </div>

              <div className="relative flex gap-6">
                <div className="absolute -bottom-8 left-3 top-8 w-px bg-brown/20" />
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-beige text-brown/40">
                  <Truck size={14} />
                </div>
                <div>
                  <h3 className="font-medium text-brown/40">Shipped</h3>
                </div>
              </div>

              <div className="relative flex gap-6">
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-beige text-brown/40">
                  <Package size={14} />
                </div>
                <div>
                  <h3 className="font-medium text-brown/40">Delivered</h3>
                </div>
              </div>
            </div>
            
            <div className="mt-8 rounded-lg bg-beige/30 p-4 text-sm text-brown/80 dark:bg-beige/10 dark:text-beige/80 flex items-start gap-3">
               <AlertCircle size={18} className="shrink-0 text-brown/50 mt-0.5" />
               <p>Updates might be slightly delayed. Please wait 24-48 hours after payment for tracking details to sync.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
