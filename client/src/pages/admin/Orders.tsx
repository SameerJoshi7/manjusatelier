import { useEffect, useState } from 'react';
import { ChevronDown, Package, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import type { Order } from '@/types';

interface AdminOrder extends Omit<Order, 'user'> {
  user?: { _id: string; name: string; email: string } | string;
  customOrderId?: string;
  utrNumber?: string;
}

const statuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

const statusColor: Record<string, string> = {
  processing: 'bg-gold/20 text-brown-dark',
  confirmed: 'bg-forest/15 text-forest',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-forest/20 text-forest',
  cancelled: 'bg-red-100 text-red-600',
};

const payColor: Record<string, string> = {
  SUCCESSFUL: 'bg-forest/15 text-forest',
  UTR_VERIFIED: 'bg-forest/15 text-forest',
  PAYMENT_PENDING: 'bg-gold/20 text-brown-dark',
  PENDING_UTR: 'bg-orange-100 text-orange-700',
  UTR_VERIFICATION_PENDING: 'bg-purple-100 text-purple-700',
  FAILED: 'bg-red-100 text-red-600',
};

export default function Orders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get<{ orders: AdminOrder[] }>(`/orders${filter ? `?status=${filter}` : ''}`)
      .then(({ orders }) => setOrders(orders))
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeStatus = async (id: string, orderStatus: string) => {
    setUpdating(id);
    try {
      const { order } = await api.patch<{ order: AdminOrder }>(`/orders/${id}/status`, {
        orderStatus,
      });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, orderStatus: order.orderStatus } : o)));
      notify('Order status updated');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Update failed', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const verifyUtr = async (id: string, verified: boolean) => {
    let adminUtr = '';
    if (verified) {
      adminUtr = window.prompt('Please enter the UTR number from your bank statement:') || '';
      if (!adminUtr) return; // User cancelled or entered nothing
    }

    setUpdating(id);
    try {
      const { order } = await api.patch<{ order: AdminOrder }>(`/orders/${id}/verify-utr`, {
        verified,
        adminUtr,
      });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, paymentStatus: order.paymentStatus, orderStatus: order.orderStatus } : o)));
      notify(verified ? 'UTR Verified! Stock deducted.' : 'UTR Rejected.');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Verification failed', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const customerName = (o: AdminOrder) =>
    typeof o.user === 'object' && o.user ? o.user.name : o.shippingAddress.fullName || 'Customer';

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-brown-dark dark:text-beige">Orders</h1>
          <p className="mt-1 text-brown/60 dark:text-beige/60">
            {loading ? 'Loading…' : `${orders.length} order${orders.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-full border border-brown/15 bg-white px-4 py-2 text-sm outline-none focus:border-brown dark:bg-[#26201a]"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </header>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card-surface grid place-items-center py-20 text-center">
          <Package className="text-brown/40" size={40} />
          <p className="mt-3 font-serif text-xl text-brown-dark dark:text-beige">No orders yet</p>
          <p className="mt-1 text-sm text-brown/50 dark:text-beige/50">
            Orders will appear here once customers check out.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className={cn("card-surface overflow-hidden", o.paymentStatus === 'UTR_VERIFICATION_PENDING' && "border-2 border-purple-400")}>
              <button
                onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                className="flex w-full items-center gap-4 p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-brown-dark dark:text-beige">
                    {o.customOrderId || `#${o._id.slice(-8).toUpperCase()}`}
                  </p>
                  <p className="truncate text-xs text-brown/50 dark:text-beige/50">
                    {customerName(o)} · {new Date(o.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <span className={cn('hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline', payColor[o.paymentStatus] || 'bg-gray-100 text-gray-700')}>
                  {o.paymentStatus.replace(/_/g, ' ')}
                </span>
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold capitalize', statusColor[o.orderStatus])}>
                  {o.orderStatus}
                </span>
                <span className="w-24 text-right font-semibold text-brown-dark dark:text-beige">
                  {formatPrice(o.total)}
                </span>
                <ChevronDown
                  size={18}
                  className={cn('shrink-0 text-brown/40 transition-transform', expanded === o._id && 'rotate-180')}
                />
              </button>

              {expanded === o._id && (
                <div className="grid gap-6 border-t border-brown/10 p-4 md:grid-cols-2">
                  {/* Items */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-brown-dark dark:text-beige">
                      Items
                    </h3>
                    <div className="space-y-2">
                      {o.items.map((it) => (
                        <div key={it.product} className="flex items-center gap-3">
                          <img src={it.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                          <span className="flex-1 text-sm text-brown-dark dark:text-beige">
                            {it.name}
                          </span>
                          <span className="text-xs text-brown/50">
                            {it.quantity} × {formatPrice(it.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <dl className="mt-3 space-y-1 border-t border-brown/10 pt-3 text-sm">
                      <div className="flex justify-between text-brown/60 dark:text-beige/60">
                        <dt>Subtotal</dt>
                        <dd>{formatPrice(o.subtotal)}</dd>
                      </div>
                      {o.discount > 0 && (
                        <div className="flex justify-between text-forest">
                          <dt>Discount {o.couponCode ? `(${o.couponCode})` : ''}</dt>
                          <dd>-{formatPrice(o.discount)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between text-brown/60 dark:text-beige/60">
                        <dt>Shipping</dt>
                        <dd>{o.shippingFee === 0 ? 'Free' : formatPrice(o.shippingFee)}</dd>
                      </div>
                      <div className="flex justify-between font-semibold text-brown-dark dark:text-beige">
                        <dt>Total</dt>
                        <dd>{formatPrice(o.total)}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Shipping + status control */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-brown-dark dark:text-beige">
                      Shipping & Payment Info
                    </h3>
                    <div className="rounded-xl bg-beige/30 p-3 text-sm text-brown/80 dark:bg-beige/10 dark:text-beige/80">
                      <p className="font-medium">{o.shippingAddress.fullName}</p>
                      <p>{o.shippingAddress.phone}</p>
                      <p>
                        {o.shippingAddress.line1}
                        {o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ''}
                      </p>
                      <p>
                        {o.shippingAddress.city}, {o.shippingAddress.state} -{' '}
                        {o.shippingAddress.postalCode}
                      </p>
                      {typeof o.user === 'object' && o.user && (
                        <p className="mt-2 text-xs text-brown/50">{o.user.email}</p>
                      )}
                      
                      <div className="mt-3 border-t border-brown/10 pt-2">
                         <p className="text-xs text-brown/50">Method: {o.paymentMethod || 'UPI'}</p>
                         {o.utrNumber && (
                           <p className="font-mono text-sm mt-1">
                             UTR: <span className="font-bold text-brown-dark dark:text-beige">{o.utrNumber}</span>
                           </p>
                         )}
                      </div>
                    </div>
                    
                    {o.paymentStatus === 'UTR_VERIFICATION_PENDING' && (
                      <div className="mt-4 flex gap-2">
                        <Button 
                          size="sm" 
                          disabled={updating === o._id}
                          className="flex-1 bg-forest text-white hover:bg-forest/90"
                          onClick={() => verifyUtr(o._id, true)}
                        >
                          <CheckCircle2 size={16} className="mr-1" /> Approve UTR
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          disabled={updating === o._id}
                          onClick={() => verifyUtr(o._id, false)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle size={16} /> Reject
                        </Button>
                      </div>
                    )}

                    <label className="mt-4 block text-sm font-semibold text-brown-dark dark:text-beige">
                      Update Shipping Status
                    </label>
                    <select
                      value={o.orderStatus}
                      disabled={updating === o._id}
                      onChange={(e) => changeStatus(o._id, e.target.value)}
                      className="input mt-1.5 capitalize"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
