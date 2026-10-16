import { Bot, Globe, MapPin, type LucideIcon } from 'lucide-react';
import type { CategoryId } from '../../data/types';
import { CATEGORIES } from '../../data/questions';

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  tunisie: MapPin,
  international: Globe,
  ia: Bot,
};

export const CATEGORY_TONE: Record<CategoryId, string> = {
  tunisie: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10',
  international: 'text-sky-300 border-sky-400/30 bg-sky-400/10',
  ia: 'text-violet-300 border-violet-400/30 bg-violet-400/10',
};

export function CategoryChip({ category, size = 'md' }: { category: CategoryId; size?: 'md' | 'lg' }) {
  const Icon = CATEGORY_ICONS[category];
  return (
    <span className={`chip ${CATEGORY_TONE[category]} ${size === 'lg' ? '!text-base !px-4 !py-1.5' : ''}`}>
      <Icon size={size === 'lg' ? 18 : 14} aria-hidden="true" />
      {CATEGORIES[category].label}
    </span>
  );
}
