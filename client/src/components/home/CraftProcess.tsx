import { Lightbulb, PencilRuler, Hand, CheckCircle, PackageOpen, Truck } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

const steps = [
  { icon: Lightbulb, title: 'Idea', desc: 'Every creation starts with inspiration.' },
  { icon: PencilRuler, title: 'Design', desc: 'Sketching and planning each detail.' },
  { icon: Hand, title: 'Handcraft', desc: 'Shaping the piece entirely by hand.' },
  { icon: CheckCircle, title: 'Quality Check', desc: 'Inspected for that perfect finish.' },
  { icon: PackageOpen, title: 'Packaging', desc: 'Lovingly wrapped, ready to gift.' },
  { icon: Truck, title: 'Delivery', desc: 'Delivered safely to your door.' },
];

export function CraftProcess() {
  return (
    <section className="section bg-forest/5 dark:bg-[#1f2620]">
      <div className="container-x">
        <SectionHeading eyebrow="The Craft" title="From Idea to Doorstep" />
        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08} className="relative text-center">
              <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-brown shadow-soft dark:bg-[#26201a]">
                <step.icon size={26} />
                <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-gold text-xs font-bold text-brown-dark">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-serif text-lg text-brown-dark dark:text-beige">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-brown/60 dark:text-beige/60">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
