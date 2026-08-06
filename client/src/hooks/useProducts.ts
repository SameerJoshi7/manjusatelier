import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Paginated, Product } from '@/types';

export interface ProductQuery {
  search?: string;
  category?: string;
  material?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

function toQueryString(q: ProductQuery): string {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== false) params.set(k, String(v));
  });
  return params.toString();
}

export function useProducts(query: ProductQuery) {
  const [data, setData] = useState<Paginated<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = query.page || 1;
  
  // We track baseKey to reset data when non-pagination filters change
  const baseQuery = { ...query };
  delete baseQuery.page;
  const baseKey = toQueryString(baseQuery);
  const key = toQueryString(query);

  useEffect(() => {
    let active = true;
    
    // Only show hard loading state on initial fetch or filter change (page 1)
    if (page === 1) {
      setLoading(true);
      setData(null);
    }
    
    setError(null);
    api
      .get<Paginated<Product> & { success: boolean }>(`/products?${key}`)
      .then((res) => {
        if (active) {
          setData((prev) => {
            // If it's page 1, or we don't have data, just replace it
            if (page === 1 || !prev) return res;
            // Otherwise, append the new products
            return {
              ...res,
              products: [...prev.products, ...res.products],
            };
          });
        }
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [key, page]);

  return { data, loading, error };
}
