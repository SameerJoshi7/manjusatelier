import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { placeholder } from '@/lib/placeholder';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  /** Optional label baked into the fallback placeholder. */
  fallbackLabel?: string;
}

/** Image with native lazy-loading, a shimmer placeholder, and a branded
 * SVG fallback if the source fails to load. */
export function LazyImage({
  className,
  wrapperClassName,
  alt,
  src,
  fallbackLabel,
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const effectiveSrc = errored
    ? placeholder(String(alt || src || 'manjus'), 800, 800, fallbackLabel ?? String(alt || ''))
    : src;

  return (
    <div className={cn('relative overflow-hidden', wrapperClassName)}>
      {!loaded && <div className="absolute inset-0 shimmer" aria-hidden />}
      <img
        loading="lazy"
        decoding="async"
        alt={alt}
        src={effectiveSrc}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!errored) setErrored(true);
          setLoaded(true);
        }}
        className={cn(
          'transition-opacity duration-700',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...props}
      />
    </div>
  );
}
