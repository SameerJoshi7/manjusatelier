import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface PaginatedResponse {
  products: Product[];
}

export function RecentlyViewed({ currentProductId }: { currentProductId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      // Filter out the current product being viewed
      const ids = stored.filter((id: string) => id !== currentProductId).slice(0, 4);
      
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      api.get<PaginatedResponse>(`/products?ids=${ids.join(',')}`)
        .then(res => {
          // Maintain the order of recently viewed
          const productMap = new Map(res.products.map(p => [p._id, p]));
          const orderedProducts = ids.map((id: string) => productMap.get(id)).filter(Boolean) as Product[];
          setProducts(orderedProducts);
        })
        .finally(() => setLoading(false));
    } catch (e) {
      setLoading(false);
    }
  }, [currentProductId]);

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-20">
      <h2 className="mb-8 font-serif text-3xl text-brown-dark dark:text-beige">Recently Viewed</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-x-8">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
