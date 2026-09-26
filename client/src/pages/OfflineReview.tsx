import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Star, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OfflineReview() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await api.get<{ success: boolean; products: any[] }>('/products?limit=100');
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setRating = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.name || !formData.rating) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await api.post('/reviews/offline', formData);
      setStatus('success');
    } catch (error: any) {
      console.error('Review submission error:', error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to submit review. Please try again.');
    }
  };

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-serif text-4xl text-brown-dark md:text-5xl">Leave a Review</h1>
        <p className="mx-auto mt-4 max-w-lg text-brown/80 text-lg">
          Did you buy something from our offline stall? We'd love to hear your feedback!
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500">
              <CheckCircle size={40} />
            </div>
            <h3 className="font-serif text-3xl text-brown-dark">Thank You!</h3>
            <p className="mt-4 max-w-sm text-lg text-brown/80">
              Your feedback means the world to us and helps others know what to expect.
            </p>
            <Button
              className="mt-8"
              onClick={() => {
                setStatus('idle');
                setFormData({ ...formData, comment: '', rating: 5, productId: '' });
              }}
              variant="secondary"
            >
              Write Another Review
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {loading ? (
              <div className="text-center text-brown/60">Loading products...</div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="productId" className="text-sm font-medium text-brown-dark">
                  Which product did you purchase? *
                </label>
                <select
                  id="productId"
                  name="productId"
                  required
                  value={formData.productId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-brown/20 px-4 py-2.5 text-brown outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold bg-white"
                >
                  <option value="" disabled>
                    Select a product
                  </option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-brown-dark">
                Your Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-brown/20 px-4 py-2.5 text-brown outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-brown-dark">Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={cn(
                        'transition-colors',
                        star <= formData.rating
                          ? 'fill-gold text-gold hover:text-gold/80 hover:fill-gold/80'
                          : 'text-brown/20 hover:text-brown/40'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium text-brown-dark">
                Review (Optional)
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={4}
                value={formData.comment}
                onChange={handleChange}
                className="w-full resize-none rounded-lg border border-brown/20 px-4 py-3 text-brown outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
                placeholder="Tell us what you liked about it..."
              />
            </div>

            {status === 'error' && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
