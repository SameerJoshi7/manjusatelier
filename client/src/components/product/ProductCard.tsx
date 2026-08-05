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
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group card-surface flex flex-row sm:flex-col overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative aspect-square w-[40%] shrink-0 sm:w-full overflow-hidden bg-beige/40">
        <Link to={`/product/${product.slug}`} aria-label={product.name}>
          <LazyImage
            src={product.images[0]}
            alt={product.name}
            wrapperClassName="h-full w-full"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1 sm:left-3 sm:top-3">
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
          className="absolute right-2 top-2 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-white/90 text-brown shadow-soft backdrop-blur transition hover:scale-110"
        >
          <Heart
            size={16}
            className={cn(wished && 'fill-red-500 text-red-500 animate-heart-pop')}
          />
        </button>

        {/* Desktop Quick Actions (Hidden on Mobile) */}
        <div className="hidden absolute inset-x-3 bottom-3 sm:flex translate-y-4 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            to={`/product/${product.slug}`}
            className="btn flex-1 bg-white/95 py-2.5 text-sm text-brown backdrop-blur hover:bg-white"
          >
            <Eye size={16} /> View Details
          </Link>
          <button
            onClick={() => {
              if (!product.inStock) return;
              add(product);
              notify('Added to cart');
            }}
            disabled={!product.inStock}
            aria-label="Add to cart"
            className="btn bg-brown px-3 py-2.5 text-cream hover:bg-brown-dark"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs uppercase tracking-wide text-brown/50 dark:text-beige/50">
          {categoryName(product)}
        </p>
        <Link to={`/product/${product.slug}`} className="mt-1">
          <h3 className="font-serif text-sm sm:text-lg leading-snug text-brown-dark transition-colors group-hover:text-brown dark:text-beige line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <Rating value={product.rating} count={product.reviewCount} className="mt-1 sm:mt-2" />
        
        <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-semibold text-brown-dark dark:text-beige">
            {formatPrice(price)}
          </span>
          {product.discount > 0 && (
            <>
              <span className="text-xs sm:text-sm text-brown/40 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="hidden sm:inline text-xs font-semibold text-forest">-{product.discount}%</span>
            </>
          )}
        </div>
        {!product.inStock && (
          <span className="mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-red-500">Out of stock</span>
        )}

        {/* Mobile-only additions (Amazon style) */}
        <div className="mt-1 flex flex-col gap-0.5 sm:hidden">
           <span className="text-[10px] text-brown/60 dark:text-beige/60">✓ 7-Day Return Policy</span>
           {product.inStock && <span className="text-[10px] text-forest">In Stock</span>}
        </div>

        <div className="mt-auto pt-2 sm:hidden">
          <button
            onClick={() => {
              if (!product.inStock) return;
              add(product);
              notify('Added to cart');
            }}
            disabled={!product.inStock}
            className="w-full rounded-full bg-[#FFD814] px-3 py-2 text-xs font-medium text-black shadow-sm transition hover:bg-[#F7CA00] disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.article>
  );
}
