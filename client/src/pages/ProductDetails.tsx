import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Share2,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Product, Review } from '@/types';
import { cn, formatPrice, finalPrice, categoryName } from '@/lib/utils';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';

const tabs = ['Description', 'Details', 'Care', 'Reviews'] as const;
type Tab = (typeof tabs)[number];

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>('Description');

  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const { notify } = useToast();

  usePageMeta({ title: product ? `${product.name} — Manju's Atelier` : 'Loading…' });

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    setTab('Description');
    api
      .get<{ product: Product; related: Product[] }>(`/products/${slug}`)
      .then((res) => {
        setProduct(res.product);
        setRelated(res.related);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    api
      .get<{ reviews: Review[] }>(`/products/${product._id}/reviews`)
      .then(({ reviews }) => setReviews(reviews))
      .catch(() => void 0);
  }, [product]);

  if (loading) return <DetailsSkeleton />;
  if (!product)
    return (
      <div className="container-x grid place-items-center py-32 text-center">
        <p className="font-serif text-3xl text-brown-dark dark:text-beige">Product not found</p>
        <Link to="/shop" className="mt-6">
          <Button>Back to shop</Button>
        </Link>
      </div>
    );

  const wished = has(product._id);
  const price = finalPrice(product);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, url }).catch(() => void 0);
    } else {
      await navigator.clipboard.writeText(url);
      notify('Link copied to clipboard', 'info');
    }
  };

  const buyNow = () => {
    add(product, qty);
    navigate('/checkout');
  };

  return (
    <div className="container-x py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-brown/50 dark:text-beige/50">
        <Link to="/" className="hover:text-brown">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="hover:text-brown">
          Shop
        </Link>
        <ChevronRight size={14} />
        <span className="text-brown-dark dark:text-beige">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          <div className="flex gap-3 sm:flex-col">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  'h-20 w-20 overflow-hidden rounded-xl border-2 transition',
                  activeImg === i ? 'border-brown' : 'border-transparent opacity-70'
                )}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          <div
            className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-beige/40"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-200"
              style={
                zoom
                  ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%` }
                  : undefined
              }
            />
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {product.badges?.map((b) => (
                <Badge key={b} type={b} />
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm uppercase tracking-wide text-brown/50 dark:text-beige/50">
            {categoryName(product)}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-brown-dark dark:text-beige">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <Rating value={product.rating} count={product.reviewCount} size={16} />
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-brown-dark dark:text-beige">
              {formatPrice(price)}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-brown/40 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="rounded-full bg-forest/15 px-2 py-0.5 text-sm font-semibold text-forest">
                  Save {product.discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-brown/70 dark:text-beige/70">
            {product.description}
          </p>

          {/* Stock */}
          <p className="mt-5 text-sm">
            {product.inStock ? (
              <span className="font-medium text-forest">
                In stock — {product.stock} available
              </span>
            ) : (
              <span className="font-medium text-red-500">Out of stock</span>
            )}
          </p>

          {/* Quantity + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-brown/20">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-beige/40"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-beige/40"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            <Button
              onClick={() => {
                add(product, qty);
                notify('Added to cart');
              }}
              disabled={!product.inStock}
              size="lg"
            >
              <ShoppingBag size={18} /> Add to Cart
            </Button>
            <Button onClick={buyNow} disabled={!product.inStock} variant="gold" size="lg">
              Buy Now
            </Button>
          </div>

          <div className="mt-4 flex gap-4">
            <button
              onClick={() => toggle(product._id)}
              className="flex items-center gap-2 text-sm text-brown/70 hover:text-brown dark:text-beige/70"
            >
              <Heart size={18} className={cn(wished && 'fill-red-500 text-red-500')} />
              {wished ? 'Wishlisted' : 'Add to wishlist'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm text-brown/70 hover:text-brown dark:text-beige/70"
            >
              <Share2 size={18} /> Share
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-brown/10 pt-6 text-center text-xs text-brown/60 dark:text-beige/60">
            <div className="flex flex-col items-center gap-1.5">
              <Truck size={20} className="text-brown" /> Free shipping over ₹1499
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <ShieldCheck size={20} className="text-brown" /> Secure payment
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <RefreshCw size={20} className="text-brown" /> 7-day returns
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex flex-wrap gap-2 border-b border-brown/10">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'relative px-4 py-3 text-sm font-medium transition-colors',
                tab === t ? 'text-brown' : 'text-brown/50 hover:text-brown dark:text-beige/50'
              )}
            >
              {t}
              {t === 'Reviews' && ` (${reviews.length})`}
              {tab === t && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-brown"
                />
              )}
            </button>
          ))}
        </div>

        <div className="py-8 text-brown/75 dark:text-beige/75">
          {tab === 'Description' && <p className="max-w-3xl leading-relaxed">{product.description}</p>}
          {tab === 'Details' && (
            <dl className="grid max-w-xl gap-3 sm:grid-cols-2">
              <Detail label="Material" value={product.material} />
              <Detail label="Dimensions" value={product.dimensions} />
              <Detail label="Color" value={product.color} />
              <Detail label="Category" value={categoryName(product)} />
            </dl>
          )}
          {tab === 'Care' && <p className="max-w-3xl leading-relaxed">{product.careInstructions}</p>}
          {tab === 'Reviews' && (
            <ReviewsTab
              product={product}
              reviews={reviews}
              canReview={!!user}
              onAdded={(r) => {
                setReviews((prev) => [r, ...prev]);
                setProduct((p) => (p ? { ...p, reviewCount: p.reviewCount + 1 } : p));
              }}
            />
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 font-serif text-3xl text-brown-dark dark:text-beige">
            You May Also Love
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between border-b border-brown/10 py-2">
      <dt className="text-brown/50 dark:text-beige/50">{label}</dt>
      <dd className="font-medium text-brown-dark dark:text-beige">{value || '—'}</dd>
    </div>
  );
}

function ReviewsTab({
  product,
  reviews,
  canReview,
  onAdded,
}: {
  product: Product;
  reviews: Review[];
  canReview: boolean;
  onAdded: (r: Review) => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { review } = await api.post<{ review: Review }>(
        `/products/${product._id}/reviews`,
        { rating, comment }
      );
      onAdded(review);
      setComment('');
      notify('Thank you for your review!');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <div className="card-surface p-6 text-center">
          <p className="font-serif text-5xl text-brown-dark dark:text-beige">
            {product.rating.toFixed(1)}
          </p>
          <Rating value={product.rating} className="mt-2 justify-center" size={18} />
          <p className="mt-2 text-sm text-brown/50 dark:text-beige/50">
            Based on {product.reviewCount} reviews
          </p>
        </div>

        {canReview ? (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <p className="font-medium text-brown-dark dark:text-beige">Write a review</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} stars`}>
                  <span className={cn('text-2xl', i <= rating ? 'text-gold' : 'text-brown/25')}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts…"
              rows={3}
              className="w-full rounded-xl border border-brown/15 bg-white p-3 text-sm outline-none focus:border-brown dark:bg-[#26201a]"
            />
            <Button type="submit" disabled={submitting} size="sm">
              {submitting ? 'Submitting…' : 'Submit review'}
            </Button>
          </form>
        ) : (
          <p className="mt-6 rounded-xl bg-beige/40 p-4 text-sm text-brown/70 dark:bg-beige/10">
            <Link to="/login" className="font-medium text-brown underline">
              Log in
            </Link>{' '}
            to write a review.
          </p>
        )}
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-brown/50 dark:text-beige/50">
            No reviews yet — be the first to share!
          </p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="card-surface p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium text-brown-dark dark:text-beige">{r.name}</p>
                <Rating value={r.rating} />
              </div>
              {r.comment && (
                <p className="mt-2 text-sm text-brown/70 dark:text-beige/70">{r.comment}</p>
              )}
              <p className="mt-2 text-xs text-brown/40">
                {new Date(r.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="container-x grid gap-10 py-10 lg:grid-cols-2">
      <Skeleton className="aspect-square rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  );
}
