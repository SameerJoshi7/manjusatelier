import { Target, Eye, Sparkles } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Reveal } from '@/components/ui/Reveal';
import { LazyImage } from '@/components/ui/LazyImage';
import { CraftProcess } from '@/components/home/CraftProcess';
import { placeholder } from '@/lib/placeholder';

const timeline = [
  { year: '2014', title: 'The First Pour', desc: 'Manju crafts her very first resin piece at her kitchen table.' },
  { year: '2017', title: 'A Growing Passion', desc: 'Weekend markets and word of mouth turn a hobby into a small business.' },
  { year: '2020', title: 'Manju\u2019s Atelier is Born', desc: 'The studio opens its doors and welcomes its first artisans.' },
  { year: '2024', title: 'Nationwide Love', desc: 'Thousands of handmade pieces now live in homes across India.' },
];

export default function About() {
  usePageMeta({ title: "Our Story — Manju's Atelier" });

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[50vh] items-center overflow-hidden">
        <img
          src={placeholder('manjus-about', 1920, 900)}
          alt="Artisan studio"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-brown-dark/60" />
        <div className="container-x text-cream">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Our Story
            </span>
            <h1 className="mt-3 max-w-2xl font-serif text-4xl md:text-6xl">
              A Woman, A Passion, A Legacy of Handmade
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Founder story */}
      <section className="section container-x">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <LazyImage
              src={placeholder('manjus-founder2', 900, 1000, 'Our Founder')}
              alt="Manju in her studio"
              wrapperClassName="overflow-hidden rounded-3xl"
              className="aspect-[4/5] w-full object-cover"
            />
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="font-serif text-4xl text-brown-dark dark:text-beige">
              Meet Manju, Our Founder
            </h2>
            <div className="mt-5 space-y-4 text-brown/70 dark:text-beige/70">
              <p>
                What began as a quiet escape from a busy corporate life slowly blossomed into a
                lifelong passion. Manju discovered that working with her hands — shaping clay,
                pouring resin, weaving thread — brought a kind of joy that nothing else could.
              </p>
              <p>
                She turned that joy into Manju&apos;s Atelier, a home for handmade creations that
                carry warmth, intention, and story. Every piece we make is a small act of love,
                designed to be treasured for years to come.
              </p>
              <p className="font-serif text-2xl italic text-brown">
                &ldquo;Handmade is imperfect, and that&apos;s exactly what makes it beautiful.&rdquo;
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission / Vision / Why */}
      <section className="section bg-beige/30 dark:bg-[#231d17]">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: 'Our Mission', text: 'To bring handmade warmth into every home while empowering local artisans.' },
            { icon: Eye, title: 'Our Vision', text: 'A world that chooses meaningful, sustainable craft over mass production.' },
            { icon: Sparkles, title: 'Why Handmade', text: 'Because every imperfection tells a story, and every piece is truly one of a kind.' },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.1}>
              <div className="card-surface h-full p-8">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-brown">
                  <c.icon size={24} />
                </span>
                <h3 className="mt-5 font-serif text-2xl text-brown-dark dark:text-beige">
                  {c.title}
                </h3>
                <p className="mt-2 text-brown/70 dark:text-beige/70">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="section container-x">
        <h2 className="text-center font-serif text-4xl text-brown-dark dark:text-beige">
          Our Journey
        </h2>
        <div className="relative mx-auto mt-14 max-w-2xl">
          <div className="absolute left-4 top-0 h-full w-px bg-brown/20 md:left-1/2" />
          {timeline.map((item, i) => (
            <Reveal key={item.year} delay={i * 0.05}>
              <div
                className={`relative mb-10 pl-12 md:w-1/2 md:pl-0 ${
                  i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'
                }`}
              >
                <span
                  className={`absolute left-2.5 top-1.5 h-3 w-3 rounded-full bg-gold ring-4 ring-cream dark:ring-[#1c1712] md:left-auto ${
                    i % 2 === 0 ? 'md:-right-1.5' : 'md:-left-1.5'
                  }`}
                />
                <p className="font-serif text-2xl text-gold">{item.year}</p>
                <h3 className="mt-1 font-serif text-xl text-brown-dark dark:text-beige">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-brown/70 dark:text-beige/70">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CraftProcess />
    </div>
  );
}
