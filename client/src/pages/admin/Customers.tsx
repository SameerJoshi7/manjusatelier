import { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get<{ customers: Customer[] }>(`/admin/customers${search ? `?search=${search}` : ''}`)
      .then(({ customers }) => setCustomers(customers))
      .catch((e) => notify(getErrorMessage(e), 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delay = setTimeout(load, 300);
    return () => clearTimeout(delay);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-brown-dark">Customers</h1>
          <p className="mt-1 text-sm text-brown/70">View and manage customer data</p>
        </div>
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full sm:w-72"
        />
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-beige/40">
              <tr>
                <th className="px-6 py-4 font-semibold text-brown-dark">Customer</th>
                <th className="px-6 py-4 font-semibold text-brown-dark">Contact</th>
                <th className="px-6 py-4 font-semibold text-brown-dark">Joined</th>
                <th className="px-6 py-4 font-semibold text-brown-dark text-right">Orders</th>
                <th className="px-6 py-4 font-semibold text-brown-dark text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown/10">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-12 ml-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-brown/50">
                    No customers found matching "{search}"
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="transition-colors hover:bg-beige/10">
                    <td className="px-6 py-4">
                      <div className="font-medium text-brown-dark">{c.name}</div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-brown/70">
                        <Mail size={14} />
                        <a href={`mailto:${c.email}`} className="hover:text-brown underline-offset-2 hover:underline">{c.email}</a>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-2 text-brown/70">
                          <Phone size={14} />
                          <a href={`tel:${c.phone}`} className="hover:text-brown">{c.phone}</a>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-brown/70">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {formatDate(c.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-brown/5 px-2.5 py-1 text-sm font-medium text-brown-dark">
                        <ShoppingBag size={14} />
                        {c.orderCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-forest">
                      {formatPrice(c.totalSpent || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
