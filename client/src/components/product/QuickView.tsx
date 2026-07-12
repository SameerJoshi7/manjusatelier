import { AnimatePresence, motion } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { formatPrice, finalPrice, categoryName } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickView({ product, onClose }: QuickViewProps) {
  const { add } = useCart();
  const { notify } = useToast();

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-brown-dark/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Quick view: ${product.name}`}
        >
          <motion.div
            className="relative grid w-full max-w-3xl gap-6 overflow-hidden rounded-2xl bg-cream p-4 shadow-lift dark:bg-[#26201a] md:grid-cols-2 md:p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brown shadow-soft hover:scale-110"
            >
              <X size={18} />
            </button>

            <img
              src={product.images[0]}
              alt={product.name}
              className="aspect-square w-full rounded-xl object-cover"
            />

            <div className="flex flex-col">
              <div className="flex gap-1.5">
                {product.badges?.map((b) => (
                  <Badge key={b} type={b} />
                ))}
              </div>
              <p className="mt-2 text-xs uppercase tracking-wide text-brown/50">
                {categoryName(product)}
              </p>
              <h2 className="mt-1 font-serif text-2xl text-brown-dark dark:text-beige">
                {product.name}
              </h2>
              <Rating value={product.rating} count={product.reviewCount} className="mt-2" />
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-brown-dark dark:text-beige">
                  {formatPrice(finalPrice(product))}
                </span>
                {product.discount > 0 && (
                  <span className="text-brown/40 line-through">{formatPrice(product.price)}</span>
                )}
              </div>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-brown/70 dark:text-beige/70">
                {product.description}
              </p>

              <div className="mt-auto flex flex-col gap-2 pt-5">
                <Button
                  onClick={() => {
                    add(product);
                    notify('Added to cart');
                    onClose();
                  }}
                  disabled={!product.inStock}
                >
                  <ShoppingBag size={18} /> {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Link to={`/product/${product.slug}`} onClick={onClose}>
                  <Button variant="secondary" fullWidth>
                    View Full Details
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
