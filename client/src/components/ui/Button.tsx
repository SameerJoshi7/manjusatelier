import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brown text-cream hover:bg-brown-dark shadow-soft hover:shadow-lift',
  secondary:
    'border border-brown/40 text-brown hover:bg-brown hover:text-cream dark:text-beige dark:border-beige/30',
  ghost: 'text-brown hover:bg-brown/10 dark:text-beige dark:hover:bg-beige/10',
  gold: 'bg-gold text-brown-dark hover:brightness-105 shadow-soft hover:shadow-lift',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn('btn', variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';
