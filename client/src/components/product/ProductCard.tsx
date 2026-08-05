import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';
import { cn, formatPrice, finalPrice, categoryName } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { LazyImage } from '@/components/ui/LazyImage';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { has, toggle } = useWishlist();
  const { add } = useCart();
  const { notify } = useToast();
  const wished = has(product._id);
  const price = finalPrice(product);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group card-surface flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-beige/40">
        <Link to={`/product/${product.slug}`} aria-label={product.name}>
          <LazyImage
            src={product.images[0]}
            alt={product.name}
            wrapperClassName="h-full w-full"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badges?.slice(0, 2).map((b) => (
            <Badge key={b} type={b} />
          ))}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => {
            toggle(product._id);
            notify(wished ? 'Removed from wishlist' : 'Added to wishlist', 'info');
          }}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brown shadow-soft backdrop-blur transition hover:scale-110"
        >
          <Heart
            size={18}
            className={cn(wished && 'fill-red-500 text-red-500 animate-heart-pop')}
          />
        </button>

        {/* Quick actions */}
        <div className="absolute inset-x-2 bottom-2 flex translate-y-0 gap-2 opacity-100 transition-all duration-300 lg:inset-x-3 lg:bottom-3 lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          <Link
            to={`/product/${product.slug}`}
            className="btn flex-1 bg-white/95 py-2 px-2 text-xs text-brown backdrop-blur hover:bg-white sm:py-2.5 sm:px-3 sm:text-sm"
          >
            <Eye size={16} /> <span className="hidden sm:inline">View Details</span>
          </Link>
          <button
            onClick={() => {
              if (!product.inStock) return;
              add(product);
              notify('Added to cart');
            }}
            disabled={!product.inStock}
            aria-label="Add to cart"
            className="btn bg-brown px-3 py-2 text-cream hover:bg-brown-dark sm:py-2.5"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-wide text-brown/50 dark:text-beige/50">
          {categoryName(product)}
        </p>
        <Link to={`/product/${product.slug}`} className="mt-1 flex-1">
          <h3 className="font-serif text-lg leading-snug text-brown-dark transition-colors group-hover:text-brown dark:text-beige">
            {product.name}
          </h3>
        </Link>
        <Rating value={product.rating} count={product.reviewCount} className="mt-2" />
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-brown-dark dark:text-beige">
            {formatPrice(price)}
          </span>
          {product.discount > 0 && (
            <>
              <span className="text-sm text-brown/40 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs font-semibold text-forest">-{product.discount}%</span>
            </>
          )}
        </div>
        {!product.inStock && (
          <span className="mt-2 text-xs font-medium text-red-500">Out of stock</span>
        )}
      </div>
    </motion.article>
  );
}
