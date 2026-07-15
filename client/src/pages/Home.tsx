import { Hero } from '@/components/home/Hero';
import { CouponScroller } from '@/components/home/CouponScroller';
import { ProductFeed } from '@/components/home/ProductFeed';
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
      <CouponScroller />
      <ProductFeed />
    </>
  );
}
