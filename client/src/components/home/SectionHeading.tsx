import { Reveal } from '@/components/ui/Reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

export function SectionHeading({ eyebrow, title, subtitle, center = true }: SectionHeadingProps) {
  return (
    <Reveal className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 font-serif text-4xl text-brown-dark dark:text-beige md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-brown/70 dark:text-beige/70">{subtitle}</p>
      )}
    </Reveal>
  );
}
