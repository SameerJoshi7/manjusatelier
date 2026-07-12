import { Hero } from '@/components/home/Hero';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { AboutSection } from '@/components/home/AboutSection';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { CraftProcess } from '@/components/home/CraftProcess';
import { Testimonials } from '@/components/home/Testimonials';
import { CustomizationBanner } from '@/components/home/CustomizationBanner';
import { GiftSection } from '@/components/home/GiftSection';
import { InstagramGallery } from '@/components/home/InstagramGallery';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Home() {
  usePageMeta({
    title: "Manju's Atelier — Handcrafted with Love, Made to Last",
    description:
      'Discover premium handmade crafts — resin art, clay crafts, wall decor and personalised gifts, handcrafted with love.',
  });

  return (
    <>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
      <AboutSection />
      <WhyChooseUs />
      <CraftProcess />
      <GiftSection />
      <Testimonials />
      <CustomizationBanner />
      <InstagramGallery />
    </>
  );
}
