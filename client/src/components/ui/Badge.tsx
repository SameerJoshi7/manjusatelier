import { cn } from '@/lib/utils';
import type { Badge as BadgeType } from '@/types';

const styles: Record<BadgeType, string> = {
  New: 'bg-forest text-white',
  Sale: 'bg-gold text-brown-dark',
  Limited: 'bg-brown-dark text-cream',
  Handmade: 'bg-white/90 text-brown border border-brown/20',
};

export function Badge({ type, className }: { type: BadgeType; className?: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        styles[type],
        className
      )}
    >
      {type}
    </span>
  );
}
