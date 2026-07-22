import { useState } from 'react';
import { Send, Loader2, Megaphone } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function Marketing() {
  usePageMeta({ title: "Marketing — Admin — Manju's Atelier" });
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    couponCode: '',
    discountPercentage: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      notify('Title and content are required', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to send this email to all subscribed users?')) return;

    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; message: string; count: number }>('/admin/marketing/broadcast', {
        ...formData,
        discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : undefined,
      });
      notify(res.message, 'success');
      setFormData({ title: '', content: '', couponCode: '', discountPercentage: '' });
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Failed to send broadcast', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-brown-dark dark:text-beige">Marketing & Broadcasts</h1>
          <p className="mt-1 text-sm text-brown/70 dark:text-beige/70">
            Send promotional emails and offers to opted-in customers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1c1712]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-brown-dark dark:text-beige">
                  Email Subject / Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Flash Sale! Get 20% Off"
                  className="w-full rounded-xl border-none bg-cream px-4 py-3 text-brown-dark outline-none focus:ring-2 focus:ring-gold dark:bg-[#2c2621] dark:text-beige"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-brown-dark dark:text-beige">
                  Email Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Describe your offer, new collection, or announcement..."
                  className="w-full resize-none rounded-xl border-none bg-cream px-4 py-3 text-brown-dark outline-none focus:ring-2 focus:ring-gold dark:bg-[#2c2621] dark:text-beige"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-brown-dark dark:text-beige">
                    Coupon Code (Optional)
                  </label>
                  <input
                    type="text"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleChange}
                    placeholder="e.g. SUMMER20"
                    className="w-full rounded-xl border-none bg-cream px-4 py-3 text-brown-dark outline-none focus:ring-2 focus:ring-gold dark:bg-[#2c2621] dark:text-beige"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-brown-dark dark:text-beige">
                    Discount Percentage (Optional)
                  </label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    placeholder="e.g. 20"
                    min="1"
                    max="100"
                    className="w-full rounded-xl border-none bg-cream px-4 py-3 text-brown-dark outline-none focus:ring-2 focus:ring-gold dark:bg-[#2c2621] dark:text-beige"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 font-medium text-brown-dark transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-5 w-5" /> Send Broadcast
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="rounded-2xl bg-cream/50 p-6 dark:bg-[#1c1712]/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gold/20 text-gold rounded-full">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-brown-dark dark:text-beige">Important info</h3>
          </div>
          <ul className="space-y-4 text-sm text-brown/70 dark:text-beige/70">
            <li>• Emails are only sent to users who have opted into promotional emails.</li>
            <li>• A legally compliant "Unsubscribe" link is automatically appended to the bottom of all promotional emails.</li>
            <li>• Emails are sent in batches to prevent server overload. Please wait while the broadcast processes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
