import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api';
import type { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickView } from '@/components/product/QuickView';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export default function Wishlist() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quick, setQuick] = useState<Product | null>(null);
  usePageMeta({ title: "Wishlist — Manju's Atelier" });

  useEffect(() => {
    let active = true;
    setLoading(true);
    // Fetch a generous page and filter client-side by wishlisted ids.
    api
      .get<{ products: Product[] }>('/products?limit=48')
      .then(({ products }) => {
        if (active) setProducts(products.filter((p) => ids.includes(p._id)));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [ids]);

  return (
    <div className="container-x py-10">
      <h1 className="flex items-center gap-3 font-serif text-4xl text-brown-dark dark:text-beige">
        <Heart className="text-red-500" /> My Wishlist
      </h1>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-brown/20 py-24 text-center">
          <p className="font-serif text-2xl text-brown-dark dark:text-beige">
            Your wishlist is empty
          </p>
          <p className="mt-2 text-sm text-brown/60 dark:text-beige/60">
            Tap the heart on any product to save it here.
          </p>
          <Link to="/shop" className="mt-6">
            <Button>Explore products</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} onQuickView={setQuick} />
          ))}
        </div>
      )}

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
