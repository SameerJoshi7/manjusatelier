import { useState, useEffect } from 'react';
import { Hero } from '@/components/home/Hero';
import { CouponScroller } from '@/components/home/CouponScroller';
import { ProductFeed } from '@/components/home/ProductFeed';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Home() {
  const [showHero] = useState(() => !sessionStorage.getItem('hasSeenHero'));

  useEffect(() => {
    if (showHero) {
      sessionStorage.setItem('hasSeenHero', 'true');
    }
  }, [showHero]);

  usePageMeta({
    title: "Manju's Atelier — Handcrafted with Love, Made to Last",
    description:
      'Discover premium handmade crafts — resin art, clay crafts, wall decor and personalised gifts, handcrafted with love.',
  });

  return (
    <>
      {showHero && <Hero />}
      <CouponScroller />
      <ProductFeed />
    </>
  );
}
