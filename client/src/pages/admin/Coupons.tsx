import { useEffect, useState } from 'react';
import { Plus, Trash2, Ticket } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: 'percent' | 'flat';
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
  validFrom?: string;
  expiresAt?: string;
  active: boolean;
}

const emptyForm = { 
  code: '', 
  description: '', 
  type: 'percent' as 'percent' | 'flat', 
  value: '', 
  minSubtotal: '0', 
  maxDiscount: '',
  validFrom: '',
  expiresAt: ''
};

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get<{ coupons: Coupon[] }>('/coupons')
      .then(({ coupons }) => setCoupons(coupons))
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/coupons', {
        code: form.code.toUpperCase(),
        description: form.description,
        type: form.type,
        value: Number(form.value),
        minSubtotal: Number(form.minSubtotal) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        validFrom: form.validFrom || undefined,
        expiresAt: form.expiresAt || undefined,
      });
      notify('Coupon created');
      setForm(emptyForm);
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Coupon) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    try {
      await api.delete(`/coupons/${c._id}`);
      setCoupons((prev) => prev.filter((x) => x._id !== c._id));
      notify('Coupon deleted');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-brown-dark dark:text-beige">Coupons</h1>
        <p className="mt-1 text-brown/60 dark:text-beige/60">Create and manage discount codes.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Create form */}
        <form onSubmit={create} className="card-surface h-fit space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl text-brown-dark dark:text-beige">
            <Plus size={18} /> New Coupon
          </h2>
          <Field label="Code">
            <input
              className="input uppercase"
              required
              placeholder="WELCOME10"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />
          </Field>
          <Field label="Description">
            <input
              className="input"
              required
              placeholder="10% off your first order"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'percent' | 'flat' })}>
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </Field>
            <Field label={form.type === 'percent' ? 'Value (%)' : 'Value (₹)'}>
              <input type="number" min="0" className="input" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min order (₹)">
              <input type="number" min="0" className="input" value={form.minSubtotal} onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })} />
            </Field>
            <Field label="Max discount (₹)">
              <input type="number" min="0" className="input" placeholder="optional" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valid From">
              <input type="date" className="input" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
            </Field>
            <Field label="Valid Until">
              <input type="date" className="input" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </Field>
          </div>
          <Button type="submit" fullWidth disabled={saving}>
            {saving ? 'Creating…' : 'Create coupon'}
          </Button>
        </form>

        {/* List */}
        <div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="card-surface grid place-items-center py-16 text-center">
              <Ticket className="text-brown/40" size={36} />
              <p className="mt-2 text-sm text-brown/50 dark:text-beige/50">No coupons yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((c) => (
                <div key={c._id} className="card-surface flex items-center gap-4 p-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gold/15 text-brown">
                    <Ticket size={20} />
                  </span>
                  <div className="flex-1">
                    <p className="font-mono font-semibold text-brown-dark dark:text-beige">
                      {c.code}
                    </p>
                    <p className="text-sm text-brown-dark/80 dark:text-beige/80 mb-0.5">
                      {c.description}
                    </p>
                    <p className="text-xs text-brown/50 dark:text-beige/50">
                      {c.type === 'percent' ? `${c.value}% off` : `${formatPrice(c.value)} off`}
                      {c.minSubtotal > 0 && ` · min ${formatPrice(c.minSubtotal)}`}
                      {c.maxDiscount ? ` · cap ${formatPrice(c.maxDiscount)}` : ''}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-semibold',
                      c.active ? 'bg-forest/15 text-forest' : 'bg-brown/10 text-brown/60'
                    )}
                  >
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => remove(c)}
                    aria-label="Delete"
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
