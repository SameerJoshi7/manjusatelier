import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { LazyImage } from '@/components/ui/LazyImage';
import { Button } from '@/components/ui/Button';
import { placeholder } from '@/lib/placeholder';

export function AboutSection() {
  return (
    <section className="section container-x">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <LazyImage
              src={placeholder('manjus-founder', 900, 1000, 'In the Studio')}
              alt="Manju, the founder, crafting in her studio"
              wrapperClassName="overflow-hidden rounded-3xl"
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-white p-5 shadow-lift dark:bg-[#26201a] sm:block">
              <p className="font-serif text-3xl text-brown">10+</p>
              <p className="text-sm text-brown/60 dark:text-beige/60">years of craft</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Our Story
          </span>
          <h2 className="mt-3 font-serif text-4xl text-brown-dark dark:text-beige md:text-5xl">
            From a Passion to a Purpose
          </h2>
          <div className="mt-5 space-y-4 text-brown/70 dark:text-beige/70">
            <p>
              Manju&apos;s Atelier began at a kitchen table, with a single pour of resin and a
              dream. What started as a way to unwind became a calling — to create beautiful,
              meaningful objects entirely by hand.
            </p>
            <p>
              Today, every piece is still made in small batches by Manju and her small team of
              artisans. We believe handmade is more than a technique; it&apos;s a way of putting
              love and intention into everything we create.
            </p>
          </div>
          <Link to="/about" className="mt-8 inline-block">
            <Button>
              Read Our Full Story <ArrowRight size={18} />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
