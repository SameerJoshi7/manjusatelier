import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Category } from '@/types';

// Simple module-level cache so categories are fetched once.
let cache: Category[] | null = null;
const listeners = new Set<(c: Category[]) => void>();

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    const update = (c: Category[]) => setCategories(c);
    listeners.add(update);
    api
      .get<{ categories: Category[] }>('/categories')
      .then(({ categories }) => {
        cache = categories;
        listeners.forEach((l) => l(categories));
      })
      .catch(() => void 0)
      .finally(() => setLoading(false));
    return () => {
      listeners.delete(update);
    };
  }, []);

  return { categories, loading };
}
