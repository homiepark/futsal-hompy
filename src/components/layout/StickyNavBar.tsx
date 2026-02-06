import { CategoryTabs } from '@/components/findteam/CategoryTabs';

export function StickyNavBar() {
  return (
    <div className="sticky top-0 z-40">
      {/* Category Tabs Only */}
      <CategoryTabs />
    </div>
  );
}
