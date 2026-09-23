import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageLoader } from '@/components/ui/PageLoader';
import { useToast } from '@/components/ui/Toast';

export default function Analytics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  useEffect(() => {
    api
      .get<{ metrics: any }>('/analytics/funnel?days=30')
      .then((res) => setMetrics(res.metrics))
      .catch((err) => notify(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [notify]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 p-6">
      <h1 className="font-serif text-3xl text-brown-dark dark:text-beige">Analytics & Funnel</h1>
      <p className="text-sm text-brown/70 dark:text-beige/70">Last 30 days conversion metrics</p>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {['product_viewed', 'added_to_cart', 'checkout_started', 'order_placed'].map(event => {
            const data = metrics?.[event] || { count: 0, uniqueCount: 0 };
            return (
              <div key={event} className="card-surface p-6">
                <p className="text-sm font-medium uppercase text-brown/50 dark:text-beige/50">
                  {event.replace(/_/g, ' ')}
                </p>
                <div className="mt-2 text-3xl font-serif text-brown-dark dark:text-beige">
                  {data.uniqueCount}
                </div>
                <p className="mt-1 text-sm text-brown/60 dark:text-beige/60">
                  Unique Sessions (Total: {data.count})
                </p>
              </div>
            );
        })}
      </div>
    </div>
  );
}
