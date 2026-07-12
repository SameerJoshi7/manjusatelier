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

  const key = toQueryString(query);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .get<Paginated<Product> & { success: boolean }>(`/products?${key}`)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [key]);

  return { data, loading, error };
}
