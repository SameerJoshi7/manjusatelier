import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, LogOut, User as UserIcon } from 'lucide-react';
import { api } from '@/lib/api';
import type { Order } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

import { useToast } from '@/components/ui/Toast';

const statusStyles: Record<string, string> = {
  processing: 'bg-gold/20 text-brown-dark',
  confirmed: 'bg-forest/15 text-forest',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-forest/20 text-forest-dark',
  cancelled: 'bg-red-100 text-red-600',
};

export default function Account() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // UTR Modal state
  const [utrPrompt, setUtrPrompt] = useState<string | null>(null);
  const [newUtr, setNewUtr] = useState('');
  const [updatingUtr, setUpdatingUtr] = useState(false);

  usePageMeta({ title: "My Account — Manju's Atelier" });

  useEffect(() => {
    if (!loading && !user) navigate('/login?redirect=/account');
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user)
      api
        .get<{ orders: Order[] }>('/orders/mine')
        .then(({ orders }) => setOrders(orders))
        .catch(() => void 0)
        .finally(() => setLoadingOrders(false));
  }, [user]);

  const submitUtr = async (orderId: string, utr: string) => {
    setUpdatingUtr(true);
    try {
      const { order } = await api.put<{ order: Order }>(`/orders/${orderId}/edit-utr`, { utrNumber: utr });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? order : o)));
      notify('UTR updated successfully.');
    } catch (e: any) {
      notify(e.response?.data?.error || 'Failed to update UTR.', 'error');
    } finally {
      setUpdatingUtr(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brown text-cream">
            <UserIcon size={26} />
          </span>
          <div>
            <h1 className="font-serif text-3xl text-brown-dark dark:text-beige">{user.name}</h1>
            <p className="text-sm text-brown/60 dark:text-beige/60">{user.email}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => logout().then(() => navigate('/'))}>
          <LogOut size={16} /> Logout
        </Button>
      </div>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-serif text-2xl text-brown-dark dark:text-beige">
          <Package size={22} /> My Orders
        </h2>

        {loadingOrders ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-brown/20 py-16 text-center">
            <p className="text-brown/60 dark:text-beige/60">You haven&apos;t placed any orders yet.</p>
            <Link to="/shop" className="mt-4">
              <Button>Start shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="card-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brown/10 pb-3">
                  <div>
                    <p className="font-medium text-brown-dark dark:text-beige">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-brown/50">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-semibold capitalize',
                        statusStyles[order.orderStatus]
                      )}
                    >
                      {order.orderStatus}
                    </span>
                    <span className="font-semibold text-brown-dark dark:text-beige">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
                {order.paymentMethod === 'UPI' &&
                 (order.paymentStatus === 'PENDING_UTR' || order.paymentStatus === 'UTR_VERIFICATION_PENDING') &&
                 !order.utrEdited && (
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => {
                        setNewUtr('');
                        setUtrPrompt(order._id);
                      }}
                      className="text-xs font-medium text-gold hover:text-gold-light underline"
                    >
                      Edit UTR
                    </button>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-3">
                  {order.items.map((item) => (
                    <div key={item.product} className="flex items-center gap-2">
                      <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm text-brown-dark dark:text-beige">{item.name}</p>
                        <p className="text-xs text-brown/50">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* UTR Modal */}
      {utrPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-brown-dark">
            <h3 className="mb-2 text-lg font-serif text-brown-dark dark:text-beige">Edit UTR Number</h3>
            <p className="mb-4 text-sm text-brown/70 dark:text-beige/70">
              Please enter the correct 12-digit UTR for this payment.
            </p>
            <input
              type="text"
              className="w-full rounded-xl border border-brown/20 bg-cream px-4 py-2 mb-4 dark:border-beige/20 dark:bg-[#2c2621] outline-none focus:border-gold text-brown-dark dark:text-beige"
              value={newUtr}
              onChange={(e) => setNewUtr(e.target.value.replace(/\D/g, ''))}
              maxLength={12}
              placeholder="12-digit UTR"
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setUtrPrompt(null)}>Cancel</Button>
              <Button 
                disabled={newUtr.length !== 12 || updatingUtr}
                onClick={() => {
                  const id = utrPrompt;
                  setUtrPrompt(null);
                  submitUtr(id, newUtr);
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
