import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickView } from '@/components/product/QuickView';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types';

export function ProductFeed() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { categories, loading: catLoading } = useCategories();
  const [quick, setQuick] = useState<Product | null>(null);

  const query = useMemo(() => ({
    category: selectedCategory || undefined,
    limit: 12,
  }), [selectedCategory]);

  const { data, loading: prodLoading } = useProducts(query);

  return (
    <section className="section bg-beige/30 dark:bg-[#231d17]">
      <div className="container-x">
        <header className="mb-10 text-center">
          <h2 className="font-serif text-3xl text-brown-dark dark:text-beige">Our Collection</h2>
          <p className="mt-2 text-sm text-brown/60 dark:text-beige/60">
            Explore all our handmade pieces or select a category below.
          </p>
        </header>

        {/* Category Pills */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          <Button
            variant={selectedCategory === null ? 'primary' : 'secondary'}
            size="sm"
            className="rounded-full bg-white dark:bg-transparent"
            onClick={() => setSelectedCategory(null)}
          >
            All Items
          </Button>
          {!catLoading && categories.map((cat) => (
            <Button
              key={cat._id}
              variant={selectedCategory === cat.slug ? 'primary' : 'secondary'}
              size="sm"
              className="rounded-full bg-white dark:bg-transparent"
              onClick={() => setSelectedCategory(cat.slug)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {prodLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : data?.products.map((p: Product) => (
                <ProductCard key={p._id} product={p} onQuickView={setQuick} />
              ))}
        </div>

        {!prodLoading && data?.products.length === 0 && (
          <div className="py-20 text-center text-brown/60 dark:text-beige/60">
            No products found in this category.
          </div>
        )}

      </div>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </section>
  );
}
