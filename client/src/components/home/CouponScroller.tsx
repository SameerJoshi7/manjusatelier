import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface APICoupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minSubtotal: number;
  maxDiscount?: number;
}

export function CouponScroller() {
  const [coupons, setCoupons] = useState<APICoupon[]>([]);

  useEffect(() => {
    api.get<{ success: boolean; coupons: APICoupon[] }>('/coupons/active')
      .then(res => setCoupons(res.coupons || []))
      .catch(() => {});
  }, []);

  if (coupons.length === 0) return null;

  return (
    <div className="flex overflow-hidden bg-brown-dark text-beige py-3 border-y border-gold/20">
      <motion.div
        className="flex gap-8 whitespace-nowrap px-4"
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 20,
        }}
      >
        {/* Repeat list to create infinite scroll effect */}
        {[...coupons, ...coupons, ...coupons, ...coupons, ...coupons].map((coupon, i) => (
          <div key={`${coupon._id}-${i}`} className="flex items-center gap-2 font-medium text-sm md:text-base">
            <span className="text-gold">{i % 2 === 0 ? <Sparkles size={16} /> : <Tag size={16} />}</span>
            <span>Use code <span className="font-bold text-cream bg-white/10 px-2 py-0.5 rounded ml-1">{coupon.code}</span></span>
            <span className="text-beige/70 ml-1">- {coupon.description}</span>
            <span className="mx-4 text-gold/30">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
