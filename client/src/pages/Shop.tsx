import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, LayoutGrid, List, X, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickView } from '@/components/product/QuickView';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { cn, formatPrice, finalPrice, categoryName } from '@/lib/utils';
import { Rating } from '@/components/ui/Rating';
import type { Product } from '@/types';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'priceLow', label: 'Price: Low to High' },
  { value: 'priceHigh', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const materials = ['Epoxy Resin', 'Terracotta Clay', 'Cotton Yarn', 'Wood', 'Canvas', 'Concrete'];
const colors = ['Blue', 'Gold', 'Beige', 'Brown', 'Teal', 'Multicolor', 'White', 'Grey'];

const PAGE_SIZE = 9;

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { categories } = useCategories();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quick, setQuick] = useState<Product | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(Number(params.get('maxPrice')) || 5000);

  usePageMeta({ title: "Shop — Manju's Atelier" });

  const page = Number(params.get('page')) || 1;

  const query = useMemo(
    () => ({
      search: params.get('search') || undefined,
      category: params.get('category') || undefined,
      material: params.get('material') || undefined,
      color: params.get('color') || undefined,
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      inStock: params.get('inStock') === 'true',
      sort: params.get('sort') || 'newest',
      page,
      limit: PAGE_SIZE,
    }),
    [params, page]
  );

  const { data, loading } = useProducts(query);

  const update = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    setParams({}, { replace: true });
    setMaxPrice(5000);
  };

  const activeFilters = ['category', 'material', 'color', 'search', 'inStock', 'maxPrice'].filter(
    (k) => params.get(k)
  );

  const FiltersPanel = (
    <div className="space-y-7">
      <FilterGroup title="Category">
        <div className="space-y-1.5">
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => update('category', params.get('category') === c.slug ? undefined : c.slug)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                params.get('category') === c.slug
                  ? 'bg-brown text-cream'
                  : 'hover:bg-beige/40 dark:hover:bg-beige/10'
              )}
            >
              {c.name}
              <span className="text-xs opacity-60">{c.productCount ?? 0}</span>
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={`Max Price: ${formatPrice(maxPrice)}`}>
        <input
          type="range"
          min={200}
          max={5000}
          step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          onMouseUp={() => update('maxPrice', String(maxPrice))}
          onTouchEnd={() => update('maxPrice', String(maxPrice))}
          className="w-full accent-brown"
        />
      </FilterGroup>

      <FilterGroup title="Material">
        <div className="flex flex-wrap gap-2">
          {materials.map((m) => (
            <Chip
              key={m}
              active={params.get('material') === m}
              onClick={() => update('material', params.get('material') === m ? undefined : m)}
            >
              {m}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <Chip
              key={c}
              active={params.get('color') === c}
              onClick={() => update('color', params.get('color') === c ? undefined : c)}
            >
              {c}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={params.get('inStock') === 'true'}
            onChange={(e) => update('inStock', e.target.checked ? 'true' : undefined)}
            className="h-4 w-4 accent-brown"
          />
          In stock only
        </label>
      </FilterGroup>

      {activeFilters.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
          <X size={14} /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container-x py-10">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-brown-dark dark:text-beige md:text-5xl">
          Shop the Collection
        </h1>
        <p className="mt-2 text-brown/60 dark:text-beige/60">
          {loading ? 'Loading…' : `${data?.total ?? 0} handcrafted pieces`}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">{FiltersPanel}</div>
        </aside>

        <div>
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal size={16} /> Filters
              {activeFilters.length > 0 && (
                <span className="ml-1 rounded-full bg-gold px-1.5 text-xs text-brown-dark">
                  {activeFilters.length}
                </span>
              )}
            </Button>

            <div className="relative flex-1 min-w-[180px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40"
              />
              <input
                defaultValue={params.get('search') || ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') update('search', (e.target as HTMLInputElement).value);
                }}
                placeholder="Search products…"
                className="w-full rounded-full border border-brown/15 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-brown dark:bg-[#26201a]"
              />
            </div>

            <select
              value={params.get('sort') || 'newest'}
              onChange={(e) => update('sort', e.target.value)}
              className="rounded-full border border-brown/15 bg-white px-4 py-2 text-sm outline-none focus:border-brown dark:bg-[#26201a]"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <div className="hidden rounded-full border border-brown/15 p-1 sm:flex">
              <button
                onClick={() => setView('grid')}
                aria-label="Grid view"
                className={cn('rounded-full p-1.5', view === 'grid' && 'bg-brown text-cream')}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView('list')}
                aria-label="List view"
                className={cn('rounded-full p-1.5', view === 'list' && 'bg-brown text-cream')}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : data && data.products.length > 0 ? (
            view === 'grid' ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
                {data.products.map((p: Product) => (
                  <ProductCard key={p._id} product={p} onQuickView={setQuick} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {data.products.map((p: Product) => (
                  <ListRow key={p._id} product={p} />
                ))}
              </div>
            )
          ) : (
            <div className="grid place-items-center rounded-2xl border border-dashed border-brown/20 py-24 text-center">
              <p className="font-serif text-2xl text-brown-dark dark:text-beige">
                No products found
              </p>
              <p className="mt-2 text-sm text-brown/60 dark:text-beige/60">
                Try adjusting your filters or search.
              </p>
              <Button className="mt-6" onClick={clearAll}>
                Clear filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: data.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => update('page', String(i + 1))}
                  className={cn(
                    'grid h-10 w-10 place-items-center rounded-full text-sm font-medium transition-colors',
                    page === i + 1
                      ? 'bg-brown text-cream'
                      : 'border border-brown/15 hover:bg-beige/40'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            className="fixed inset-0 z-[80] bg-brown-dark/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFiltersOpen(false)}
          >
            <motion.div
              className="absolute right-0 top-0 h-full w-[300px] overflow-y-auto bg-cream p-6 dark:bg-[#1c1712]"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-2xl text-brown-dark dark:text-beige">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close">
                  <X />
                </button>
              </div>
              {FiltersPanel}
              <Button className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>
                Show results
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-serif text-lg text-brown-dark dark:text-beige">{title}</h3>
      {children}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs transition-colors',
        active
          ? 'border-brown bg-brown text-cream'
          : 'border-brown/20 hover:border-brown dark:border-beige/20'
      )}
    >
      {children}
    </button>
  );
}

function ListRow({ product }: { product: Product }) {
  return (
    <a
      href={`/product/${product.slug}`}
      className="card-surface flex gap-4 overflow-hidden p-3 transition-shadow hover:shadow-lift"
    >
      <img
        src={product.images[0]}
        alt={product.name}
        loading="lazy"
        className="h-32 w-32 shrink-0 rounded-xl object-cover"
      />
      <div className="flex flex-col py-1">
        <p className="text-xs uppercase tracking-wide text-brown/50">{categoryName(product)}</p>
        <h3 className="mt-1 font-serif text-xl text-brown-dark dark:text-beige">{product.name}</h3>
        <Rating value={product.rating} count={product.reviewCount} className="mt-1" />
        <p className="mt-2 line-clamp-2 text-sm text-brown/60 dark:text-beige/60">
          {product.description}
        </p>
        <span className="mt-auto text-lg font-semibold text-brown-dark dark:text-beige">
          {formatPrice(finalPrice(product))}
        </span>
      </div>
    </a>
  );
}
