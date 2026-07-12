import { Link } from 'react-router-dom';
import { Cake, Heart, Gem, Briefcase, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { staggerContainer, staggerItem } from '@/components/ui/Reveal';

const gifts = [
  { icon: Cake, label: 'Birthday', tag: 'birthday' },
  { icon: Heart, label: 'Wedding', tag: 'wedding' },
  { icon: Gem, label: 'Anniversary', tag: 'anniversary' },
  { icon: Briefcase, label: 'Corporate', tag: 'corporate' },
  { icon: PartyPopper, label: 'Festival', tag: 'festival' },
];

export function GiftSection() {
  return (
    <section className="section bg-beige/30 dark:bg-[#231d17]">
      <div className="container-x">
        <SectionHeading
          eyebrow="Gifting"
          title="Perfect for Every Occasion"
          subtitle="Thoughtful handmade gifts that carry meaning, for the moments that matter."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5"
        >
          {gifts.map((g) => (
            <motion.div key={g.label} variants={staggerItem}>
              <Link
                to={`/shop?search=${g.tag}`}
                className="card-surface group flex flex-col items-center gap-3 p-8 text-center transition-all hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-brown transition-colors group-hover:bg-gold group-hover:text-brown-dark">
                  <g.icon size={26} />
                </span>
                <span className="font-medium text-brown-dark dark:text-beige">{g.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
