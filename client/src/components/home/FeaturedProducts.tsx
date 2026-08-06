import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { api } from '@/lib/api';
import type { Product } from '@/types';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ products: Product[] }>('/products/featured')
      .then(({ products }) => setProducts(products))
      .catch(() => void 0)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section bg-beige/30 dark:bg-[#231d17]">
      <div className="container-x">
        <SectionHeading
          eyebrow="Handpicked"
          title="Featured Products"
          subtitle="Our most-loved handmade pieces, chosen for their craftsmanship and character."
        />

        <div className="mt-12 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 lg:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="break-inside-avoid mb-4 sm:mb-6">
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
        </div>

        <Reveal className="mt-12 text-center">
          <Link to="/shop">
            <Button variant="secondary" size="lg">
              View All Products <ArrowRight size={18} />
            </Button>
          </Link>
        </Reveal>
      </div>

    </section>
  );
}
