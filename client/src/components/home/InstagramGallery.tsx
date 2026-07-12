import { Instagram } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { LazyImage } from '@/components/ui/LazyImage';
import { placeholder } from '@/lib/placeholder';

// Pinterest-style masonry using CSS columns.
const shots = Array.from({ length: 8 }).map((_, i) => ({
  seed: `insta-${i}`,
  tall: i % 3 === 0,
}));

export function InstagramGallery() {
  return (
    <section className="section container-x">
      <SectionHeading
        eyebrow="@manjusatelier"
        title="From Our Studio"
        subtitle="Follow along for behind-the-scenes glimpses of the making process."
      />
      <Reveal className="mt-12">
        <div className="columns-2 gap-4 md:columns-4 [&>a]:mb-4">
          {shots.map((s) => (
            <a
              key={s.seed}
              href="https://www.instagram.com/manjusatelier"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block break-inside-avoid overflow-hidden rounded-2xl"
              aria-label="Instagram post"
            >
              <LazyImage
                src={placeholder(s.seed, 600, s.tall ? 800 : 600)}
                alt="Studio moment"
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 grid place-items-center bg-brown-dark/0 opacity-0 transition-all group-hover:bg-brown-dark/40 group-hover:opacity-100">
                <Instagram className="text-cream" size={26} />
              </div>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
