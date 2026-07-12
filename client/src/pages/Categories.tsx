import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { usePageMeta } from '@/hooks/usePageMeta';
import { LazyImage } from '@/components/ui/LazyImage';
import { getCategoryIcon } from '@/lib/icons';
import { Skeleton } from '@/components/ui/Skeleton';
import { staggerContainer, staggerItem } from '@/components/ui/Reveal';
import { placeholder } from '@/lib/placeholder';

export default function Categories() {
  const { categories, loading } = useCategories();
  usePageMeta({ title: "Categories — Manju's Atelier" });

  return (
    <div className="container-x py-12">
      <header className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Explore</span>
        <h1 className="mt-3 font-serif text-4xl text-brown-dark dark:text-beige md:text-5xl">
          Shop by Category
        </h1>
        <p className="mt-4 text-brown/70 dark:text-beige/70">
          Every collection tells its own story. Find the craft that speaks to you.
        </p>
      </header>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/2] rounded-3xl" />
            ))
          : categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <motion.div key={cat._id} variants={staggerItem}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="group relative block aspect-[3/2] overflow-hidden rounded-3xl"
                  >
                    <LazyImage
                      src={cat.image || placeholder(cat.slug, 800, 560, cat.name)}
                      alt={cat.name}
                      fallbackLabel={cat.name}
                      wrapperClassName="h-full w-full"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/90 via-brown-dark/25 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-cream">
                      <Icon className="mb-2 text-gold" size={26} />
                      <h2 className="font-serif text-2xl">{cat.name}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-cream/75">{cat.description}</p>
                      <span className="mt-3 flex items-center gap-1 text-sm font-medium text-gold">
                        Shop now
                        <ArrowUpRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                        />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
      </motion.div>
    </div>
  );
}
