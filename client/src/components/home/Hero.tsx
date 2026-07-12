import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { placeholder } from '@/lib/placeholder';

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // Subtle parallax on the hero image only.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.45, 0.7]);

  return (
    <section ref={ref} className="relative flex min-h-[92vh] items-center overflow-hidden">
      {/* Background image with parallax */}
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <img
          src={placeholder('manjus-hero', 1920, 1200)}
          alt="Handcrafted pieces displayed in a warm artisan studio"
          className="h-[120%] w-full object-cover"
          fetchPriority="high"
        />
      </motion.div>
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 -z-10 bg-gradient-to-b from-brown-dark/60 via-brown-dark/40 to-brown-dark/70"
      />

      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-cream"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-cream/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <Sparkles size={14} className="text-gold" /> Handcrafted in small batches
          </span>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] md:text-7xl">
            Handmade Creations That Tell a Story
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/85">
            Each piece at Manju&apos;s Atelier is lovingly made by hand — no two exactly alike.
            Bring home warmth, character, and craftsmanship made to last a lifetime.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/shop">
              <Button variant="gold" size="lg">
                Shop Collection <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/about">
              <Button
                size="lg"
                className="border border-cream/40 bg-transparent text-cream hover:bg-cream/10"
              >
                Learn Our Story
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/70"
      >
        <div className="h-10 w-6 rounded-full border-2 border-cream/50 p-1">
          <div className="mx-auto h-2 w-1 rounded-full bg-cream/70" />
        </div>
      </motion.div>
    </section>
  );
}
