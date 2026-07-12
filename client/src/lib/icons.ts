import {
  Home,
  Waves,
  Flower2,
  Frame,
  Gift,
  Sparkles,
  PenTool,
  Package,
  type LucideIcon,
} from 'lucide-react';

/** Map category `icon` string (stored in DB) to a Lucide component. */
export const categoryIcons: Record<string, LucideIcon> = {
  Home,
  Waves,
  Flower2,
  Frame,
  Gift,
  Sparkles,
  PenTool,
};

export function getCategoryIcon(name?: string): LucideIcon {
  return (name && categoryIcons[name]) || Package;
}
