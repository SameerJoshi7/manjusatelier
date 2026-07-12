import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}

export function Rating({ value, count, size = 14, className }: RatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)} aria-label={`Rated ${value} out of 5`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={cn(
              i <= Math.round(value) ? 'fill-gold text-gold' : 'text-brown/25'
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-brown/60 dark:text-beige/60">({count})</span>
      )}
    </div>
  );
}
