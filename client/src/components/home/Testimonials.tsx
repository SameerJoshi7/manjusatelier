import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Rating } from '@/components/ui/Rating';
import { staggerContainer, staggerItem } from '@/components/ui/Reveal';
import { api } from '@/lib/api';
import type { Review, Product } from '@/types';

interface RecentReview extends Omit<Review, 'product'> {
  product?: Pick<Product, 'name' | 'slug'>;
}

export function Testimonials() {
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .get<{ reviews: RecentReview[] }>('/reviews/recent?limit=6')
      .then(({ reviews }) => setReviews(reviews))
      .catch(() => void 0)
      .finally(() => setLoaded(true));
  }, []);

  // Nothing to show until real customers leave reviews.
  if (!loaded || reviews.length === 0) return null;

  return (
    <section className="section container-x">
      <SectionHeading eyebrow="Loved by Customers" title="Kind Words" />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="mt-12 grid gap-6 md:grid-cols-3"
      >
        {reviews.map((r) => (
          <motion.div key={r._id} variants={staggerItem} className="card-surface flex flex-col p-7">
            <Quote className="text-gold" size={30} />
            <p className="mt-4 flex-1 italic leading-relaxed text-brown/75 dark:text-beige/75">
              &ldquo;{r.comment}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-beige/60 font-serif text-lg text-brown dark:bg-beige/10">
                {r.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-medium text-brown-dark dark:text-beige">{r.name}</p>
                {r.product && (
                  <p className="text-xs text-brown/50 dark:text-beige/50">on {r.product.name}</p>
                )}
              </div>
              <Rating value={r.rating} className="ml-auto" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
