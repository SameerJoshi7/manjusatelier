import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { LazyImage } from '@/components/ui/LazyImage';
import { getCategoryIcon } from '@/lib/icons';
import { staggerContainer, staggerItem } from '@/components/ui/Reveal';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/Skeleton';
import { placeholder } from '@/lib/placeholder';

export function FeaturedCategories() {
  const { categories, loading } = useCategories();

  return (
    <section className="section container-x">
      <SectionHeading
        eyebrow="Browse"
        title="Featured Categories"
        subtitle="From glossy resin art to earthy clay crafts — discover collections made to bring warmth to every corner."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))
          : categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <motion.div key={cat._id} variants={staggerItem}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
                  >
                    <LazyImage
                      src={cat.image || placeholder(cat.slug, 600, 750, cat.name)}
                      alt={cat.name}
                      fallbackLabel={cat.name}
                      wrapperClassName="h-full w-full"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/85 via-brown-dark/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
                      <Icon size={22} className="mb-2 text-gold" />
                      <h3 className="font-serif text-lg leading-tight">{cat.name}</h3>
                      <span className="mt-1 flex items-center gap-1 text-xs text-cream/70">
                        {cat.productCount ?? 0} items
                        <ArrowUpRight
                          size={13}
                          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
      </motion.div>
    </section>
  );
}
