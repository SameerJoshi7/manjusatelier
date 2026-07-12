import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { placeholder } from '@/lib/placeholder';

export function CustomizationBanner() {
  return (
    <section className="container-x py-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-brown px-8 py-14 text-center text-cream md:px-16 md:py-20">
          <div className="absolute inset-0 opacity-20">
            <img
              src={placeholder('manjus-custom', 1600, 600)}
              alt=""
              aria-hidden
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative">
            <Sparkles className="mx-auto text-gold" size={30} />
            <h2 className="mt-4 font-serif text-3xl md:text-5xl">
              Need Something Personalised?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-cream/85">
              Have a special idea in mind? We create bespoke pieces tailored to your story, your
              colours, and your occasion.
            </p>
            <Link to="/contact" className="mt-8 inline-block">
              <Button variant="gold" size="lg">
                Request Custom Design
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
