import { useState, useEffect } from 'react';
import { Settings2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function Settings() {
  const [shippingFlat, setShippingFlat] = useState(79);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1499);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    api.get<{ setting: { shippingFlat: number, freeShippingThreshold: number } }>('/settings')
      .then(res => {
        if (res.setting) {
          setShippingFlat(res.setting.shippingFlat);
          setFreeShippingThreshold(res.setting.freeShippingThreshold);
        }
      })
      .catch(e => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [notify]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/settings', {
        shippingFlat,
        freeShippingThreshold
      });
      notify('Settings saved successfully!');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-brown-dark dark:text-beige flex items-center gap-2">
          <Settings2 className="text-brown/50" /> Settings
        </h1>
        <p className="mt-1 text-brown/60 dark:text-beige/60">Manage global store settings</p>
      </header>

      <div className="card-surface max-w-2xl p-6 md:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div>
            <h2 className="font-serif text-xl text-brown-dark dark:text-beige mb-4 border-b border-brown/10 pb-2">
              Shipping Rates
            </h2>
            
            <div className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-brown-dark dark:text-beige mb-1">
                  Flat Shipping Fee (₹)
                </span>
                <input
                  type="number"
                  min="0"
                  required
                  value={shippingFlat}
                  onChange={(e) => setShippingFlat(Number(e.target.value))}
                  className="input max-w-xs"
                />
                <p className="mt-1 text-xs text-brown/60 dark:text-beige/60">
                  The standard shipping cost for orders below the free shipping threshold.
                </p>
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-brown-dark dark:text-beige mb-1">
                  Free Shipping Threshold (₹)
                </span>
                <input
                  type="number"
                  min="0"
                  required
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="input max-w-xs"
                />
                <p className="mt-1 text-xs text-brown/60 dark:text-beige/60">
                  Orders over this amount will automatically receive free shipping.
                </p>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
